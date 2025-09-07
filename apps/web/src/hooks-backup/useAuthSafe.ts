'use client';

import { useEffect, useState } from 'react';
import { useAuth as useAuthOriginal } from '@/lib/auth';

/**
 * Safe version of useAuth hook that handles SSR
 * Returns default values during SSR and actual auth state on client
 */
export function useAuthSafe() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR, return safe defaults
  if (!isClient) {
    return {
      user: null,
      loading: true,
      login: async () => { /* noop */ },
      register: async () => { /* noop */ },
      logout: async () => { /* noop */ },
      updateUser: () => { /* noop */ },
      checkAuth: async () => { /* noop */ },
    };
  }

  // On client, use the actual auth context
  try {
    return useAuthOriginal();
  } catch (error) {
    // If context not available (shouldn't happen with ClientAuthProvider), return defaults
    return {
      user: null,
      loading: true,
      login: async () => { /* noop */ },
      register: async () => { /* noop */ },
      logout: async () => { /* noop */ },
      updateUser: () => { /* noop */ },
      checkAuth: async () => { /* noop */ },
    };
  }
}