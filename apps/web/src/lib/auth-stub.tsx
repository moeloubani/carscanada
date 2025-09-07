'use client';

import { ReactNode } from 'react';

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
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

// Temporary stub implementation to fix build
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useAuth(): AuthContextType {
  return {
    user: null,
    loading: false,
    login: async () => {},
    register: async () => {},
    logout: async () => {},
    updateUser: () => {},
    checkAuth: async () => {},
  };
}

export function useRole() {
  return {
    isBuyer: false,
    isSeller: false,
    isDealer: false,
    isDealerPremium: false,
    isDealerProfessional: false,
    canCreateListing: false,
    canManageDealer: false,
  };
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: any
) {
  return Component;
}

export function ProtectedRoute({
  children,
}: {
  children: ReactNode;
  allowedUserTypes?: Array<'buyer' | 'seller' | 'dealer'>;
  fallback?: ReactNode;
}) {
  return <>{children}</>;
}