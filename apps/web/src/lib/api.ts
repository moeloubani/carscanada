import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_ENDPOINTS } from './constants';

// Types
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let authTokens: AuthTokens | null = null;

export const setAuthTokens = (tokens: AuthTokens | null) => {
  authTokens = tokens;
  if (tokens) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
  } else {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
};

export const getAuthTokens = (): AuthTokens | null => {
  if (authTokens) return authTokens;
  
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken && refreshToken) {
      authTokens = { accessToken, refreshToken };
      return authTokens;
    }
  }
  
  return null;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const tokens = getAuthTokens();
    if (tokens && config.headers) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const tokens = getAuthTokens();
      if (tokens?.refreshToken) {
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.REFRESH_TOKEN}`, {
            refreshToken: tokens.refreshToken,
          });
          
          const newTokens: AuthTokens = response.data;
          setAuthTokens(newTokens);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          }
          
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          setAuthTokens(null);
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }
    }
    
    // Transform error for easier handling
    const apiError: ApiError = {
      message: (error.response?.data as any)?.message || error.message || 'An error occurred',
      status: error.response?.status || 500,
      errors: (error.response?.data as any)?.errors,
    };
    
    return Promise.reject(apiError);
  }
);

// API methods

// Auth
export const auth = {
  login: (email: string, password: string) =>
    api.post<AuthTokens & { user: any }>(API_ENDPOINTS.LOGIN, { email, password }),
  
  register: (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    userType: 'buyer' | 'seller' | 'dealer';
  }) => api.post<AuthTokens & { user: any }>(API_ENDPOINTS.REGISTER, data),
  
  logout: () => api.post(API_ENDPOINTS.LOGOUT),
  
  forgotPassword: (email: string) =>
    api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post(API_ENDPOINTS.RESET_PASSWORD, { token, password }),
  
  verifyEmail: (token: string) =>
    api.post(API_ENDPOINTS.VERIFY_EMAIL, { token }),
};

// User
export const user = {
  getProfile: () => api.get(API_ENDPOINTS.USER_PROFILE),
  
  updateProfile: (data: any) =>
    api.patch(API_ENDPOINTS.UPDATE_PROFILE, data),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post(API_ENDPOINTS.CHANGE_PASSWORD, { currentPassword, newPassword }),
  
  getListings: (params?: PaginationParams) =>
    api.get<PaginatedResponse<any>>(API_ENDPOINTS.USER_LISTINGS, { params }),
  
  getFavorites: (params?: PaginationParams) =>
    api.get<PaginatedResponse<any>>(API_ENDPOINTS.USER_FAVORITES, { params }),
  
  getSavedSearches: () =>
    api.get(API_ENDPOINTS.USER_SEARCHES),
};

// Listings
export const listings = {
  getAll: (params?: any) =>
    api.get<PaginatedResponse<any>>(API_ENDPOINTS.LISTINGS, { params }),
  
  getOne: (id: string) =>
    api.get(API_ENDPOINTS.LISTING_DETAIL(id)),
  
  create: (data: FormData) =>
    api.post(API_ENDPOINTS.CREATE_LISTING, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  update: (id: string, data: FormData | any) => {
    const config = data instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return api.patch(API_ENDPOINTS.UPDATE_LISTING(id), data, config);
  },
  
  delete: (id: string) =>
    api.delete(API_ENDPOINTS.DELETE_LISTING(id)),
  
  feature: (id: string) =>
    api.post(API_ENDPOINTS.FEATURE_LISTING(id)),
  
  search: (params: any) =>
    api.get<PaginatedResponse<any>>(API_ENDPOINTS.SEARCH_LISTINGS, { params }),
  
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(API_ENDPOINTS.UPLOAD_IMAGE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  deleteImage: (id: string) =>
    api.delete(API_ENDPOINTS.DELETE_IMAGE(id)),
};

// Favorites
export const favorites = {
  add: (listingId: string) =>
    api.post(API_ENDPOINTS.ADD_FAVORITE(listingId)),
  
  remove: (listingId: string) =>
    api.delete(API_ENDPOINTS.REMOVE_FAVORITE(listingId)),
};

// Messages
export const messages = {
  getConversations: () =>
    api.get(API_ENDPOINTS.CONVERSATIONS),
  
  getConversation: (id: string) =>
    api.get(API_ENDPOINTS.CONVERSATION(id)),
  
  send: (data: {
    recipientId: string;
    listingId?: string;
    message: string;
  }) => api.post(API_ENDPOINTS.SEND_MESSAGE, data),
};

// Dealers
export const dealers = {
  getAll: (params?: any) =>
    api.get<PaginatedResponse<any>>(API_ENDPOINTS.DEALERS, { params }),
  
  getOne: (id: string) =>
    api.get(API_ENDPOINTS.DEALER_DETAIL(id)),
  
  getListings: (id: string, params?: PaginationParams) =>
    api.get<PaginatedResponse<any>>(API_ENDPOINTS.DEALER_LISTINGS(id), { params }),
  
  getReviews: (id: string, params?: PaginationParams) =>
    api.get<PaginatedResponse<any>>(API_ENDPOINTS.DEALER_REVIEWS(id), { params }),
};

// Reviews
export const reviews = {
  create: (data: {
    dealerId: string;
    rating: number;
    comment: string;
  }) => api.post(API_ENDPOINTS.CREATE_REVIEW, data),
  
  update: (id: string, data: {
    rating: number;
    comment: string;
  }) => api.patch(API_ENDPOINTS.UPDATE_REVIEW(id), data),
  
  delete: (id: string) =>
    api.delete(API_ENDPOINTS.DELETE_REVIEW(id)),
};

// Subscriptions
export const subscriptions = {
  getAll: () =>
    api.get(API_ENDPOINTS.SUBSCRIPTIONS),
  
  create: (planId: string) =>
    api.post(API_ENDPOINTS.CREATE_SUBSCRIPTION, { planId }),
  
  cancel: (id: string) =>
    api.post(API_ENDPOINTS.CANCEL_SUBSCRIPTION(id)),
};

// Reports
export const reports = {
  getVehicleHistory: (vin: string) =>
    api.get(API_ENDPOINTS.VEHICLE_HISTORY(vin)),
  
  getMarketAnalysis: (params: {
    make?: string;
    model?: string;
    year?: number;
    province?: string;
  }) => api.get(API_ENDPOINTS.MARKET_ANALYSIS, { params }),
};

// Searches
export const searches = {
  save: (data: {
    name: string;
    criteria: any;
    alerts?: boolean;
  }) => api.post(API_ENDPOINTS.SAVE_SEARCH, data),
  
  delete: (id: string) =>
    api.delete(API_ENDPOINTS.DELETE_SEARCH(id)),
};

// Payments
export const payments = {
  getPackages: () =>
    api.get(API_ENDPOINTS.FEATURED_PACKAGES),
  
  createCheckoutSession: (data: {
    packageId: string;
    listingId: string;
  }) => api.post(API_ENDPOINTS.CREATE_CHECKOUT_SESSION, data),
  
  confirmPayment: (sessionId: string) =>
    api.post(API_ENDPOINTS.CONFIRM_PAYMENT, { sessionId }),
  
  getPaymentHistory: (params?: PaginationParams) =>
    api.get<PaginatedResponse<any>>(API_ENDPOINTS.PAYMENT_HISTORY, { params }),
  
  getActiveFeatures: () =>
    api.get(API_ENDPOINTS.ACTIVE_FEATURES),
};

// Export the api instance for custom requests
export default api;