export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  province?: string;
  city?: string;
  postalCode?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  isDealer: boolean;
  dealerName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}