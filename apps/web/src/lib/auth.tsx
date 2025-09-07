// Stub auth for build
export const useAuth = () => ({
  user: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  isAuthenticated: false,
  isLoading: false,
});

export const useRole = () => ({
  hasRole: () => false,
  isAdmin: false,
  isDealer: false,
  isBuyer: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => children;