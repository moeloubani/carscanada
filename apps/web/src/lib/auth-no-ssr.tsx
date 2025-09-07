'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import { auth, user as userApi, setAuthTokens, getAuthTokens } from '@/lib/api';
import { toast } from 'sonner';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  userType: 'buyer' | 'seller' | 'dealer';
  dealership?: {
    id: string;
    name: string;
    logo?: string;
    subscriptionPlan: string;
  };
  emailVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  userType: 'buyer' | 'seller' | 'dealer';
  dealershipName?: string;
}

// Create context with default values for SSR
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: () => {},
  checkAuth: async () => {},
});

// Inner provider component that uses client-side hooks
function AuthProviderInner({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const tokens = getAuthTokens();
      if (!tokens) {
        setUser(null);
        return;
      }

      const response = await userApi.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setAuthTokens(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize auth check
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login
  const login = async (email: string, password: string) => {
    try {
      const response = await auth.login(email, password);
      const { accessToken, refreshToken, user } = response.data;
      
      setAuthTokens({ accessToken, refreshToken });
      setUser(user);
      
      toast.success('Successfully logged in!');
      
      // Redirect based on user type
      if (user.userType === 'dealer') {
        router.push('/dealer/dashboard');
      } else {
        const redirectTo = pathname.startsWith('/login') ? '/' : pathname;
        router.push(redirectTo);
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  // Register
  const register = async (data: RegisterData) => {
    try {
      const response = await auth.register(data);
      const { accessToken, refreshToken, user } = response.data;
      
      setAuthTokens({ accessToken, refreshToken });
      setUser(user);
      
      toast.success('Account created successfully!');
      
      // Redirect to appropriate dashboard
      if (user.userType === 'dealer') {
        router.push('/dealer/onboarding');
      } else {
        router.push('/profile/complete');
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAuthTokens(null);
      router.push('/');
      toast.success('Successfully logged out');
    }
  };

  // Update user
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Export the provider wrapped with dynamic import to disable SSR
export const AuthProvider = dynamic(
  () => Promise.resolve(AuthProviderInner),
  { 
    ssr: false,
    // Show nothing during SSR
    loading: () => null,
  }
);

// Hook to use auth context - safe for SSR
export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

// Hook for role-based access
export function useRole() {
  const { user } = useAuth();
  
  return {
    isBuyer: user?.userType === 'buyer',
    isSeller: user?.userType === 'seller',
    isDealer: user?.userType === 'dealer',
    isDealerPremium: user?.dealership?.subscriptionPlan === 'premium',
    isDealerProfessional: user?.dealership?.subscriptionPlan === 'professional',
    canCreateListing: user?.userType === 'seller' || user?.userType === 'dealer',
    canManageDealer: user?.userType === 'dealer',
  };
}

// HOC for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string;
    allowedUserTypes?: Array<'buyer' | 'seller' | 'dealer'>;
  }
) {
  return function ProtectedComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push(options?.redirectTo || '/login');
        } else if (
          options?.allowedUserTypes &&
          !options.allowedUserTypes.includes(user.userType)
        ) {
          toast.error('You do not have permission to access this page');
          router.push('/');
        }
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    if (!user) {
      return null;
    }

    if (
      options?.allowedUserTypes &&
      !options.allowedUserTypes.includes(user.userType)
    ) {
      return null;
    }

    return <Component {...props} />;
  };
}

// Protected route wrapper component
export function ProtectedRoute({
  children,
  allowedUserTypes,
  fallback,
}: {
  children: ReactNode;
  allowedUserTypes?: Array<'buyer' | 'seller' | 'dealer'>;
  fallback?: ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (
    allowedUserTypes &&
    !allowedUserTypes.includes(user.userType)
  ) {
    return <>{fallback || <div>You do not have permission to view this content.</div>}</>;
  }

  return <>{children}</>;
}