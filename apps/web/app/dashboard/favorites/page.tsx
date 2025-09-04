'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Car, 
  MapPin, 
  Calendar, 
  DollarSign,
  Gauge,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  SlidersHorizontal
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { user as userApi, favorites as favoritesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface FavoriteListing {
  id: string;
  listingId: string;
  listing: {
    id: string;
    title: string;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    images: string[];
    location: {
      city: string;
      province: string;
    };
    status: 'active' | 'sold' | 'expired';
    seller: {
      id: string;
      name: string;
      userType: 'seller' | 'dealer';
    };
  };
  createdAt: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [priceFilter, setPriceFilter] = useState('all');
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await userApi.getFavorites();
      
      // Mock data for demonstration
      const mockFavorites: FavoriteListing[] = [
        {
          id: '1',
          listingId: '1',
          listing: {
            id: '1',
            title: '2020 Honda Civic Sport',
            make: 'Honda',
            model: 'Civic',
            year: 2020,
            price: 25000,
            mileage: 35000,
            images: ['/placeholder.jpg'],
            location: { city: 'Toronto', province: 'ON' },
            status: 'active',
            seller: { id: '1', name: 'John\'s Auto', userType: 'dealer' },
          },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '2',
          listingId: '2',
          listing: {
            id: '2',
            title: '2019 Toyota Camry LE',
            make: 'Toyota',
            model: 'Camry',
            year: 2019,
            price: 28000,
            mileage: 42000,
            images: ['/placeholder.jpg'],
            location: { city: 'Vancouver', province: 'BC' },
            status: 'active',
            seller: { id: '2', name: 'Sarah Smith', userType: 'seller' },
          },
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: '3',
          listingId: '3',
          listing: {
            id: '3',
            title: '2021 Tesla Model 3',
            make: 'Tesla',
            model: 'Model 3',
            year: 2021,
            price: 45000,
            mileage: 20000,
            images: ['/placeholder.jpg'],
            location: { city: 'Montreal', province: 'QC' },
            status: 'sold',
            seller: { id: '3', name: 'Electric Motors', userType: 'dealer' },
          },
          createdAt: new Date(Date.now() - 259200000).toISOString(),
        },
      ];
      
      setFavorites(mockFavorites);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load favorites',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string, listingId: string) => {
    try {
      await favoritesApi.remove(listingId);
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      toast({
        title: 'Success',
        description: 'Removed from favorites',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove from favorites',
      });
    } finally {
      setRemovingId(null);
    }
  };

  const filteredFavorites = favorites
    .filter(fav => {
      const searchLower = searchTerm.toLowerCase();
      return (
        fav.listing.title.toLowerCase().includes(searchLower) ||
        fav.listing.make.toLowerCase().includes(searchLower) ||
        fav.listing.model.toLowerCase().includes(searchLower) ||
        fav.listing.location.city.toLowerCase().includes(searchLower)
      );
    })
    .filter(fav => {
      switch (priceFilter) {
        case 'under25k':
          return fav.listing.price < 25000;
        case '25k-50k':
          return fav.listing.price >= 25000 && fav.listing.price <= 50000;
        case 'over50k':
          return fav.listing.price > 50000;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.listing.price - b.listing.price;
        case 'price-high':
          return b.listing.price - a.listing.price;
        case 'year':
          return b.listing.year - a.listing.year;
        case 'mileage':
          return a.listing.mileage - b.listing.mileage;
        default: // recent
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Favorites</h1>
        <p className="text-muted-foreground mt-2">
          Vehicles you've saved for later
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Saved</p>
                <p className="text-2xl font-bold">{favorites.length}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold">
                  {favorites.filter(f => f.listing.status === 'active').length}
                </p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sold</p>
                <p className="text-2xl font-bold">
                  {favorites.filter(f => f.listing.status === 'sold').length}
                </p>
              </div>
              <Badge variant="secondary">Sold</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Price</p>
                <p className="text-2xl font-bold">
                  ${Math.round(
                    favorites.reduce((sum, f) => sum + f.listing.price, 0) / favorites.length || 0
                  ).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search favorites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under25k">Under $25k</SelectItem>
                <SelectItem value="25k-50k">$25k - $50k</SelectItem>
                <SelectItem value="over50k">Over $50k</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="year">Year: Newest</SelectItem>
                <SelectItem value="mileage">Mileage: Lowest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Favorites Grid */}
      {filteredFavorites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No favorites found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search' : 'Start browsing vehicles to save your favorites'}
            </p>
            <Button onClick={() => router.push('/search')}>
              Browse Vehicles
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFavorites.map((favorite) => (
            <Card key={favorite.id} className="overflow-hidden group">
              <div className="relative h-48 bg-muted">
                {favorite.listing.images[0] ? (
                  <img
                    src={favorite.listing.images[0]}
                    alt={favorite.listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Car className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <Badge
                  className="absolute top-2 right-2"
                  variant={favorite.listing.status === 'active' ? 'default' : 
                          favorite.listing.status === 'sold' ? 'secondary' : 'destructive'}
                >
                  {favorite.listing.status}
                </Badge>
                <div className="absolute top-2 left-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => setRemovingId(favorite.id)}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {favorite.listing.title}
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    ${favorite.listing.price.toLocaleString()}
                  </p>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {favorite.listing.year}
                    </span>
                    <span className="flex items-center gap-1">
                      <Gauge className="h-3 w-3" />
                      {favorite.listing.mileage.toLocaleString()} km
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {favorite.listing.location.city}, {favorite.listing.location.province}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">
                      Saved {formatDistanceToNow(new Date(favorite.createdAt), { addSuffix: true })}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {favorite.listing.seller.userType === 'dealer' ? 'Dealer' : 'Private'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => router.push(`/listings/${favorite.listing.id}`)}
                  >
                    View Details
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push(`/dashboard/messages?listingId=${favorite.listing.id}`)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Remove Confirmation */}
      <AlertDialog open={!!removingId} onOpenChange={() => setRemovingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from favorites?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the listing from your favorites. You can always add it back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                const favorite = favorites.find(f => f.id === removingId);
                if (favorite) {
                  handleRemoveFavorite(favorite.id, favorite.listingId);
                }
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}