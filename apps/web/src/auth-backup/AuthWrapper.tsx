'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import AuthProvider with no SSR
const AuthProvider = dynamic(
  () => import('@/lib/auth').then(mod => ({ default: mod.AuthProvider })),
  { 
    ssr: false,
    // Show children during loading/SSR
    loading: () => null
  }
);

export function AuthWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}