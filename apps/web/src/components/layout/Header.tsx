'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth, useRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import {
  Menu,
  X,
  Car,
  User,
  LogOut,
  Settings,
  Heart,
  MessageSquare,
  PlusCircle,
  Building,
  Search,
  Home,
} from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const { canCreateListing, isDealer } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Car className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">CarsCanada</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/search"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Search Cars
              </Link>
              <Link
                href="/dealers"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Find Dealers
              </Link>
              {canCreateListing && (
                <Link
                  href="/listings/new"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sell Your Car
                </Link>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Desktop User Menu */}
                <div className="hidden md:flex items-center gap-4">
                  {canCreateListing && (
                    <Button asChild size="sm">
                      <Link href="/listings/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Listing
                      </Link>
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {isDealer ? (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/dealer/dashboard">
                              <Building className="mr-2 h-4 w-4" />
                              <span>Dashboard</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dealer/listings">
                              <Car className="mr-2 h-4 w-4" />
                              <span>My Listings</span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/profile">
                              <User className="mr-2 h-4 w-4" />
                              <span>Profile</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/favorites">
                              <Heart className="mr-2 h-4 w-4" />
                              <span>Favorites</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/messages">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              <span>Messages</span>
                            </Link>
                          </DropdownMenuItem>
                          {user.userType === 'seller' && (
                            <DropdownMenuItem asChild>
                              <Link href="/my-listings">
                                <Car className="mr-2 h-4 w-4" />
                                <span>My Listings</span>
                              </Link>
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href="/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => logout()}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                href="/search"
                className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Search className="h-4 w-4" />
                Search Cars
              </Link>
              <Link
                href="/dealers"
                className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Building className="h-4 w-4" />
                Find Dealers
              </Link>

              {user ? (
                <>
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-3 px-2 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {isDealer ? (
                    <>
                      <Link
                        href="/dealer/dashboard"
                        className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-accent"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Building className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/dealer/listings"
                        className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-accent"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Car className="h-4 w-4" />
                        My Listings
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-accent"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        href="/favorites"
                        className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-accent"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Heart className="h-4 w-4" />
                        Favorites
                      </Link>
                      <Link
                        href="/messages"
                        className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-accent"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Messages
                      </Link>
                    </>
                  )}

                  {canCreateListing && (
                    <Link
                      href="/listings/new"
                      className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-accent"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <PlusCircle className="h-4 w-4" />
                      Create Listing
                    </Link>
                  )}

                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md hover:bg-accent text-left w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t pt-3 space-y-2">
                    <Button className="w-full" variant="ghost" asChild>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}