'use client';

import dynamic from 'next/dynamic';

// Dynamically import MobileNav with no SSR
export const ClientMobileNav = dynamic(
  () => import('./MobileNav').then(mod => ({ default: mod.MobileNav })),
  { 
    ssr: false,
    // Don't show anything during loading
    loading: () => null
  }
);