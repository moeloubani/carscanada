'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AuthProvider } from '@/lib/auth';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';

interface LayoutWrapperProps {
  children: ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR, only render children and footer (which doesn't use auth)
  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="h-16 border-b" /> {/* Placeholder for header */}
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // After mounting, render with full auth context
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        <Footer />
        <MobileNav />
      </div>
    </AuthProvider>
  );
}