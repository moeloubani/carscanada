'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare,
  Edit,
  Trash2,
  MoreVertical,
  Car,
  DollarSign,
  Calendar,
  MapPin,
  Heart,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { user as userApi, listings as listingsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';

interface Listing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  status: 'active' | 'sold' | 'expired' | 'draft';
  views: number;
  messages: number;
  favorites: number;
  images: string[];
  location: {
    city: string;
    province: string;
  };
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
  featuredUntil?: string;
}

export default function MyListingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [deleteListingId, setDeleteListingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchListings();
  }, [page, statusFilter]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await userApi.getListings({
        page,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });
      
      // Mock data for demonstration
      const mockListings: Listing[] = [
        {
          id: '1',
          title: '2020 Honda Civic Sport',
          make: 'Honda',
          model: 'Civic',
          year: 2020,
          price: 25000,
          status: 'active',
          views: 234,
          messages: 12,
          favorites: 45,
          images: ['/placeholder.jpg'],
          location: { city: 'Toronto', province: 'ON' },
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T14:30:00Z',
        },
        {
          id: '2',
          title: '2019 Toyota Camry LE',
          make: 'Toyota',
          model: 'Camry',
          year: 2019,
          price: 28000,
          status: 'sold',
          views: 567,
          messages: 34,
          favorites: 89,
          images: ['/placeholder.jpg'],
          location: { city: 'Vancouver', province: 'BC' },
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-25T16:20:00Z',
        },
      ];

      setListings(mockListings);
      setTotalPages(response.data.meta.totalPages);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load listings',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteListingId) return;

    try {
      await listingsApi.delete(deleteListingId);
      toast({
        title: 'Success',
        description: 'Listing deleted successfully',
      });
      fetchListings();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete listing',
      });
    } finally {
      setDeleteListingId(null);
    }
  };

  const handleMarkAsSold = async (id: string) => {
    try {
      await listingsApi.update(id, { status: 'sold' });
      toast({
        title: 'Success',
        description: 'Listing marked as sold',
      });
      fetchListings();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update listing',
      });
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'sold': return 'secondary';
      case 'expired': return 'destructive';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
          <p className="text-muted-foreground">
            Manage your vehicle listings
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/listings/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Listing
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {listings.filter(l => l.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {listings.reduce((sum, l) => sum + l.views, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {listings.reduce((sum, l) => sum + l.messages, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Favorites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {listings.reduce((sum, l) => sum + l.favorites, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'grid')}>
                <TabsList>
                  <TabsTrigger value="table">Table</TabsTrigger>
                  <TabsTrigger value="grid">Grid</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <Car className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{listing.title}</p>
                            {listing.isFeatured && (
                              <Badge className="bg-yellow-500 text-black">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {listing.year} • {listing.make} {listing.model}
                          </p>
                          {listing.featuredUntil && (
                            <p className="text-xs text-muted-foreground">
                              Featured until {new Date(listing.featuredUntil).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(listing.status)}>
                        {listing.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${listing.price.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {listing.location.city}, {listing.location.province}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {listing.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {listing.messages}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {listing.favorites}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => router.push(`/listings/${listing.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/listings/${listing.id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {listing.status === 'active' && (
                            <>
                              {!listing.isFeatured && (
                                <DropdownMenuItem
                                  onClick={() => router.push(`/dashboard/featured?listingId=${listing.id}`)}
                                >
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Make Featured
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleMarkAsSold(listing.id)}
                              >
                                <DollarSign className="h-4 w-4 mr-2" />
                                Mark as Sold
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteListingId(listing.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden">
                  <div className="h-40 bg-muted flex items-center justify-center">
                    <Car className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{listing.title}</h3>
                          {listing.isFeatured && (
                            <Badge className="bg-yellow-500 text-black">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {listing.location.city}, {listing.location.province}
                        </p>
                        {listing.featuredUntil && (
                          <p className="text-xs text-muted-foreground">
                            Featured until {new Date(listing.featuredUntil).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge variant={getStatusBadgeVariant(listing.status)}>
                        {listing.status}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold mb-3">
                      ${listing.price.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {listing.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {listing.messages}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {listing.favorites}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {listing.status === 'active' && !listing.isFeatured && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/featured?listingId=${listing.id}`)}
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/dashboard/listings/${listing.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/listings/${listing.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteListingId} onOpenChange={() => setDeleteListingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your listing
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}