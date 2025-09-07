'use client';

import dynamic from 'next/dynamic';

// Dynamically import Header with no SSR
export const ClientHeader = dynamic(
  () => import('./Header').then(mod => ({ default: mod.Header })),
  { 
    ssr: false,
    // Show a placeholder during loading
    loading: () => (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto px-4">
          <div className="h-16" />
        </nav>
      </header>
    )
  }
);