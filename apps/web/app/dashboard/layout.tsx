'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ProtectedRoute, useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import {
  Home,
  Car,
  Heart,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User,
  Plus,
  BarChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'My Listings', href: '/dashboard/listings', icon: Car, badge: 'listings' },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare, badge: 'messages' },
  { name: 'Favorites', href: '/dashboard/favorites', icon: Heart, badge: 'favorites' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data for badges - in real app, this would come from API
  const badges = {
    listings: user?.userType === 'seller' || user?.userType === 'dealer' ? 5 : 0,
    messages: 3,
    favorites: 12,
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const SidebarContent = () => (
    <>
      {/* User Profile Section */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>
              {user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.userType}</p>
          </div>
        </div>
        {(user?.userType === 'seller' || user?.userType === 'dealer') && (
          <Button
            onClick={() => router.push('/dashboard/listings/new')}
            className="w-full mt-4"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const badgeCount = badges[item.badge as keyof typeof badges];
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <div className="flex items-center">
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </div>
              {badgeCount ? (
                <Badge variant={isActive ? 'secondary' : 'default'} className="ml-auto">
                  {badgeCount}
                </Badge>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-col flex-1 border-r bg-background">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b">
              <Link href="/dashboard" className="flex items-center">
                <Car className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold">CarsCanada</span>
              </Link>
            </div>
            <SidebarContent />
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/dashboard" className="flex items-center">
            <Car className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">CarsCanada</span>
          </Link>
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="lg:pl-64">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}