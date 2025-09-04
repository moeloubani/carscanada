'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Calendar, Gauge, Fuel, Settings2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Listing } from '@/hooks/useListings';
import { useToggleFavorite, useIsFavorite } from '@/hooks/useFavorites';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
  variant?: 'default' | 'compact' | 'horizontal';
  showDealer?: boolean;
  priority?: boolean;
}

export function ListingCard({ 
  listing, 
  variant = 'default',
  showDealer = true,
  priority = false 
}: ListingCardProps) {
  const [imageError, setImageError] = useState(false);
  const { isAuthenticated } = useAuth();
  const { data: isFavorite = false } = useIsFavorite(listing.id);
  const { toggleFavorite, isLoading } = useToggleFavorite();

  const primaryImage = listing.images.find(img => img.isPrimary) || listing.images[0];
  const imageUrl = imageError || !primaryImage 
    ? '/images/placeholder-car.jpg' 
    : primaryImage.url;

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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      toggleFavorite(listing.id, isFavorite);
    } else {
      // Redirect to login or show login modal
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
    }
  };

  if (variant === 'horizontal') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <Link href={`/listings/${listing.id}`} className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-80 h-48 md:h-56">
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              className="object-cover"
              priority={priority}
              onError={() => setImageError(true)}
            />
            {listing.isFeatured && (
              <Badge className="absolute top-2 left-2 bg-yellow-500 text-black">
                Featured
              </Badge>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 bg-white/80 backdrop-blur hover:bg-white"
              onClick={handleFavoriteClick}
              disabled={isLoading}
            >
              <Heart 
                className={cn(
                  "h-5 w-5",
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                )} 
              />
            </Button>
          </div>
          <div className="flex-1 p-4 md:p-6">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {listing.year} {listing.make} {listing.model}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-1">{listing.title}</p>
              </div>
              <div className="text-right ml-4">
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(listing.price)}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <Gauge className="h-4 w-4 mr-1" />
                {formatMileage(listing.mileage)}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Fuel className="h-4 w-4 mr-1" />
                {listing.fuelType}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Settings2 className="h-4 w-4 mr-1" />
                {listing.transmission}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                {listing.year}
              </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {listing.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {listing.location.city}, {listing.location.province}
              </div>
              {showDealer && listing.seller.type === 'dealer' && listing.seller.dealership && (
                <Badge variant="secondary">
                  {listing.seller.dealership.name}
                </Badge>
              )}
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <Link href={`/listings/${listing.id}`} className="flex flex-col h-full">
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover"
            priority={priority}
            onError={() => setImageError(true)}
          />
          {listing.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-black">
              Featured
            </Badge>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 bg-white/80 backdrop-blur hover:bg-white"
            onClick={handleFavoriteClick}
            disabled={isLoading}
          >
            <Heart 
              className={cn(
                "h-5 w-5",
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
              )} 
            />
          </Button>
          {listing.condition === 'New' && (
            <Badge className="absolute bottom-2 left-2 bg-green-500">
              New
            </Badge>
          )}
        </div>
        
        <div className="flex-1 p-4 flex flex-col">
          <div className="mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              {listing.year} {listing.make} {listing.model}
            </h3>
            {variant !== 'compact' && (
              <p className="text-sm text-gray-600 line-clamp-1">{listing.title}</p>
            )}
          </div>
          
          <p className="text-xl font-bold text-primary mb-3">
            {formatPrice(listing.price)}
          </p>
          
          {variant !== 'compact' && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <Gauge className="h-4 w-4 mr-1" />
                {formatMileage(listing.mileage)}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Fuel className="h-4 w-4 mr-1" />
                {listing.fuelType}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Settings2 className="h-4 w-4 mr-1" />
                {listing.transmission}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                {listing.drivetrain}
              </div>
            </div>
          )}
          
          <div className="mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {listing.location.city}, {listing.location.province}
              </div>
              {showDealer && listing.seller.type === 'dealer' && listing.seller.dealership && (
                <Badge variant="secondary" className="text-xs">
                  {listing.seller.dealership.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}