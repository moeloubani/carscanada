'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  Gauge, 
  Fuel,
  Settings2,
  Car,
  Palette,
  Shield,
  Phone,
  MessageSquare,
  Flag,
  Eye,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageGallery } from '@/components/listings/ImageGallery';
import { ContactSellerDialog } from '@/components/listings/ContactSellerDialog';
import { ListingCard } from '@/components/listings/ListingCard';
import { useListing } from '@/hooks/useListing';
import { useToggleFavorite, useIsFavorite } from '@/hooks/useFavorites';
import { useSimilarListings } from '@/hooks/useListings';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ListingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;
  const { isAuthenticated } = useAuth();
  
  const [showPhone, setShowPhone] = useState(false);
  
  const { data: listing, isLoading, error } = useListing(listingId);
  const { data: isFavorite = false } = useIsFavorite(listingId);
  const { toggleFavorite, isLoading: favoriteLoading } = useToggleFavorite();
  const { data: similarListings, isLoading: similarLoading } = useSimilarListings(
    listing || {},
    6
  );

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: `Check out this ${listing?.year} ${listing?.make} ${listing?.model}`,
          url: url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleReport = () => {
    // Open report dialog or redirect to report page
    toast.info('Report functionality coming soon');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('en-CA').format(mileage) + ' km';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-7xl px-4">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full mb-6" />
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-7xl px-4">
          <Card className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Listing not found</h3>
            <p className="text-gray-600 mb-4">
              This listing may have been removed or is no longer available.
            </p>
            <Button onClick={() => router.push('/listings')}>
              Browse Listings
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const isDealer = listing.seller.type === 'dealer';
  const sellerName = isDealer && listing.seller.dealership
    ? listing.seller.dealership.name
    : listing.seller.name;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-primary">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link href="/listings" className="text-gray-600 hover:text-primary">
              Listings
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium">
              {listing.year} {listing.make} {listing.model}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to listings
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <ImageGallery 
              images={listing.images} 
              title={`${listing.year} ${listing.make} ${listing.model}`}
            />

            {/* Title and Price */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {listing.year} {listing.make} {listing.model}
                    </h1>
                    <p className="text-lg text-gray-600">{listing.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(listing.price)}
                    </p>
                    {listing.condition === 'New' && (
                      <Badge className="mt-2 bg-green-500">New Vehicle</Badge>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (isAuthenticated) {
                        toggleFavorite(listingId, isFavorite);
                      } else {
                        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
                      }
                    }}
                    disabled={favoriteLoading}
                  >
                    <Heart className={cn(
                      "h-4 w-4 mr-2",
                      isFavorite ? "fill-red-500 text-red-500" : ""
                    )} />
                    {isFavorite ? 'Saved' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" onClick={handleReport}>
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Information */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="specs">Specifications</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Key Details</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Year</p>
                              <p className="font-medium">{listing.year}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Gauge className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Mileage</p>
                              <p className="font-medium">{formatMileage(listing.mileage)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Fuel className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Fuel Type</p>
                              <p className="font-medium">{listing.fuelType}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Settings2 className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Transmission</p>
                              <p className="font-medium">{listing.transmission}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Car className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Body Type</p>
                              <p className="font-medium">{listing.bodyType}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Palette className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Color</p>
                              <p className="font-medium">{listing.color}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Description</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">
                          {listing.description}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="specs" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Engine & Performance</h4>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Fuel Type</dt>
                            <dd className="font-medium">{listing.fuelType}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Transmission</dt>
                            <dd className="font-medium">{listing.transmission}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Drivetrain</dt>
                            <dd className="font-medium">{listing.drivetrain}</dd>
                          </div>
                        </dl>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Details</h4>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Condition</dt>
                            <dd className="font-medium">{listing.condition}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Body Type</dt>
                            <dd className="font-medium">{listing.bodyType}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Exterior Color</dt>
                            <dd className="font-medium">{listing.color}</dd>
                          </div>
                          {listing.vin && (
                            <div className="flex justify-between">
                              <dt className="text-gray-600">VIN</dt>
                              <dd className="font-medium font-mono text-sm">{listing.vin}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="features" className="mt-6">
                    {listing.features && listing.features.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {listing.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No features listed</p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Information */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      {isDealer && listing.seller.dealership?.logo ? (
                        <AvatarImage src={listing.seller.dealership.logo} alt={sellerName} />
                      ) : null}
                      <AvatarFallback>
                        {sellerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{sellerName}</h3>
                      <Badge variant={isDealer ? "default" : "secondary"} className="mt-1">
                        {isDealer ? "Dealer" : "Private Seller"}
                      </Badge>
                      {isDealer && listing.seller.dealership?.rating && (
                        <div className="flex items-center mt-2">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1 text-sm">
                            {listing.seller.dealership.rating.toFixed(1)} rating
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <ContactSellerDialog listing={listing}>
                      <Button className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Seller
                      </Button>
                    </ContactSellerDialog>

                    {listing.seller.phone && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowPhone(!showPhone)}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {showPhone ? listing.seller.phone : 'Show Phone Number'}
                      </Button>
                    )}
                  </div>

                  {isDealer && listing.seller.dealership && (
                    <Link href={`/dealers/${listing.seller.dealership.id}`}>
                      <Button variant="link" className="w-full p-0">
                        View Dealer Profile →
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {listing.location.city}, {listing.location.province}
                    </p>
                    <p className="text-sm text-gray-600">
                      {listing.location.postalCode}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Listing Info */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Listed</span>
                    <span>{formatDate(listing.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Views</span>
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {listing.views.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Listing ID</span>
                    <span className="font-mono text-xs">{listing.id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Listings */}
        {similarListings && similarListings.data.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Similar Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {similarListings.data.slice(0, 4).map(similarListing => (
                <ListingCard 
                  key={similarListing.id} 
                  listing={similarListing}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}