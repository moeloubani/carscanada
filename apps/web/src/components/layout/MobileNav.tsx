'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Don't show mobile nav on auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return null;
  }

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
    },
    {
      href: '/search',
      icon: Search,
      label: 'Search',
    },
    {
      href: '/favorites',
      icon: Heart,
      label: 'Favorites',
      requiresAuth: true,
    },
    {
      href: '/messages',
      icon: MessageSquare,
      label: 'Messages',
      requiresAuth: true,
    },
    {
      href: user ? '/profile' : '/login',
      icon: User,
      label: user ? 'Profile' : 'Login',
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          // Skip items that require auth if user is not logged in
          if (item.requiresAuth && !user) {
            return null;
          }

          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}