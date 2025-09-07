'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AuthProvider } from '@/lib/auth';

interface ClientAuthProviderProps {
  children: ReactNode;
}

export function ClientAuthProvider({ children }: ClientAuthProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR or initial hydration, render children without auth context
  // This prevents useContext errors during static page generation
  if (!isClient) {
    return <>{children}</>;
  }

  // Once on client, render with full auth context
  return <AuthProvider>{children}</AuthProvider>;
}