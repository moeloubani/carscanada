'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Car, Users, Shield, TrendingUp, MapPin, Calendar, DollarSign, ChevronRight, Zap, Award, HeadphonesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListingCard } from '@/components/listings/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeaturedListings, useRecentListings } from '@/hooks/useListings';
import { CAR_MAKES, PROVINCES, PRICE_RANGES } from '@/lib/constants';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [priceRange, setPriceRange] = useState('');

  const { data: featuredData, isLoading: featuredLoading } = useFeaturedListings(6);
  const { data: recentData, isLoading: recentLoading } = useRecentListings(8);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedMake) params.set('make', selectedMake);
    if (selectedProvince) params.set('province', selectedProvince);
    if (priceRange) {
      const range = PRICE_RANGES.find(r => r.label === priceRange);
      if (range) {
        if (range.min) params.set('minPrice', range.min.toString());
        if (range.max) params.set('maxPrice', range.max.toString());
      }
    }
    router.push(`/listings?${params.toString()}`);
  };

  const popularMakes = ['Honda', 'Toyota', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Tesla'];

  const stats = [
    { label: 'Active Listings', value: '15,000+', icon: Car },
    { label: 'Happy Customers', value: '50,000+', icon: Users },
    { label: 'Verified Dealers', value: '500+', icon: Shield },
    { label: 'Cars Sold Monthly', value: '2,000+', icon: TrendingUp },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Fast & Easy',
      description: 'Find your perfect car in minutes with our advanced search and filters',
    },
    {
      icon: Shield,
      title: 'Secure & Trusted',
      description: 'All dealers are verified and transactions are protected',
    },
    {
      icon: Award,
      title: 'Best Prices',
      description: 'Compare prices from multiple sellers to get the best deal',
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Our team is always here to help you find your dream car',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Find Your Perfect Car in Canada
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse thousands of cars from trusted dealers and private sellers across Canada
            </p>
          </div>

          {/* Search Bar */}
          <Card className="max-w-4xl mx-auto shadow-xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="lg:col-span-2">
                  <Input
                    placeholder="Search by make, model, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="h-12"
                  />
                </div>
                <Select value={selectedMake} onValueChange={setSelectedMake}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="All Makes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Makes</SelectItem>
                    {CAR_MAKES.map(make => (
                      <SelectItem key={make} value={make}>{make}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="All Provinces" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Provinces</SelectItem>
                    {PROVINCES.map(province => (
                      <SelectItem key={province.code} value={province.code}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Price</SelectItem>
                    {PRICE_RANGES.map(range => (
                      <SelectItem key={range.label} value={range.label}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch} size="lg" className="h-12">
                  <Search className="mr-2 h-5 w-5" />
                  Search Cars
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            <span className="text-gray-600">Popular searches:</span>
            {['Under $20,000', 'SUVs', 'Electric', 'Trucks', 'Luxury'].map(term => (
              <Badge
                key={term}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                onClick={() => {
                  if (term === 'Under $20,000') {
                    router.push('/listings?maxPrice=20000');
                  } else {
                    router.push(`/listings?bodyType=${term}`);
                  }
                }}
              >
                {term}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Makes */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-8">Browse by Make</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {popularMakes.map(make => (
              <Link
                key={make}
                href={`/listings?make=${make}`}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <Car className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm font-medium text-center">{make}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Listings</h2>
            <Button variant="outline" asChild>
              <Link href="/listings?featured=true">
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-8 w-1/2 mb-3" />
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredData?.data && featuredData.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredData.data.map((listing, index) => (
                <ListingCard key={listing.id} listing={listing} priority={index < 3} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No featured listings available</p>
          )}
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Recently Listed</h2>
            <Button variant="outline" asChild>
              <Link href="/listings">
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {recentLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-8 w-1/2 mb-3" />
                    <div className="space-y-2">
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentData?.data && recentData.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentData.data.map(listing => (
                <ListingCard key={listing.id} listing={listing} variant="compact" />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No recent listings available</p>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-12 w-12 mx-auto mb-4 opacity-80" />
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CarsCanada</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(feature => (
              <Card key={feature.title} className="text-center">
                <CardHeader>
                  <feature.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Dealers */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Are You a Car Dealer?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of dealers already using CarsCanada to reach more customers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register?type=dealer">
                Start Selling Today
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10" asChild>
              <Link href="/dealers">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}