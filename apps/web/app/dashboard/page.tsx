'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { 
  Car, 
  Eye, 
  MessageSquare, 
  Heart, 
  TrendingUp,
  DollarSign,
  Clock,
  Plus,
  ChevronRight,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { user as userApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  activeListings: number;
  totalViews: number;
  totalMessages: number;
  totalFavorites: number;
  viewsTrend: number;
  messagesTrend: number;
}

interface RecentActivity {
  id: string;
  type: 'view' | 'message' | 'favorite' | 'inquiry';
  title: string;
  description: string;
  timestamp: string;
  listing?: {
    id: string;
    title: string;
    price: number;
  };
  user?: {
    name: string;
    avatar?: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [recentListings, setRecentListings] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user listings if seller or dealer
      if (user?.userType === 'seller' || user?.userType === 'dealer') {
        const listingsResponse = await userApi.getListings({ limit: 5 });
        setRecentListings(listingsResponse.data.data);
        
        // Mock stats - in real app, these would come from API
        setStats({
          activeListings: listingsResponse.data.meta.total,
          totalViews: 1234,
          totalMessages: 42,
          totalFavorites: 89,
          viewsTrend: 12.5,
          messagesTrend: -5.3,
        });
      }

      // Mock activities - in real app, these would come from API
      setActivities([
        {
          id: '1',
          type: 'view',
          title: 'New view on your listing',
          description: 'Someone viewed your 2020 Honda Civic',
          timestamp: '2 hours ago',
          listing: {
            id: '1',
            title: '2020 Honda Civic',
            price: 25000,
          },
        },
        {
          id: '2',
          type: 'message',
          title: 'New message',
          description: 'John Doe sent you a message about your listing',
          timestamp: '4 hours ago',
          user: {
            name: 'John Doe',
          },
        },
        {
          id: '3',
          type: 'favorite',
          title: 'Listing favorited',
          description: 'Your 2019 Toyota Camry was added to favorites',
          timestamp: '1 day ago',
          listing: {
            id: '2',
            title: '2019 Toyota Camry',
            price: 28000,
          },
        },
      ]);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load dashboard data',
      });
    } finally {
      setLoading(false);
    }
  };

  const canCreateListing = user?.userType === 'seller' || user?.userType === 'dealer';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Stats Grid */}
      {canCreateListing && stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Active Listings"
            value={stats.activeListings}
            icon={Car}
            trend={null}
          />
          <StatsCard
            title="Total Views"
            value={stats.totalViews}
            icon={Eye}
            trend={stats.viewsTrend}
          />
          <StatsCard
            title="Messages"
            value={stats.totalMessages}
            icon={MessageSquare}
            trend={stats.messagesTrend}
          />
          <StatsCard
            title="Favorites"
            value={stats.totalFavorites}
            icon={Heart}
            trend={null}
          />
        </div>
      )}

      {/* Quick Actions */}
      {canCreateListing && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button
                onClick={() => router.push('/dashboard/listings/new')}
                className="justify-start"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </Button>
              <Button
                onClick={() => router.push('/dashboard/messages')}
                className="justify-start"
                variant="outline"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                View Messages
                {stats && stats.totalMessages > 0 && (
                  <Badge className="ml-auto" variant="secondary">
                    {stats.totalMessages}
                  </Badge>
                )}
              </Button>
              <Button
                onClick={() => router.push('/dashboard/listings')}
                className="justify-start"
                variant="outline"
              >
                <Car className="h-4 w-4 mr-2" />
                Manage Listings
              </Button>
              <Button
                onClick={() => router.push('/dashboard/analytics')}
                className="justify-start"
                variant="outline"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>
              Latest updates on your listings and interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed activities={activities} />
          </CardContent>
        </Card>

        {/* Recent Listings */}
        {canCreateListing && recentListings.length > 0 && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Listings</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard/listings')}
                >
                  View all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/dashboard/listings/${listing.id}/edit`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <Car className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {listing.year} {listing.make} {listing.model}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>${listing.price.toLocaleString()}</span>
                          <span>•</span>
                          <span>{listing.views || 0} views</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                      {listing.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* For Buyers - Show Favorites and Saved Searches */}
      {user?.userType === 'buyer' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Favorites</CardTitle>
              <CardDescription>
                Listings you've saved for later
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/dashboard/favorites')}
                className="w-full"
                variant="outline"
              >
                <Heart className="h-4 w-4 mr-2" />
                View Favorites
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved Searches</CardTitle>
              <CardDescription>
                Get notified when new listings match your criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/search')}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Search
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}