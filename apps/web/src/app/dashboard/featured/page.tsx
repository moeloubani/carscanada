'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PackageCard } from '@/components/payment/PackageCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePackages } from '@/hooks/usePackages';
import { usePayments } from '@/hooks/usePayments';
import { ArrowRight, Info, Sparkles, TrendingUp, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function FeaturedPackagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [activeFeatures, setActiveFeatures] = useState<any[]>([]);

  const { packages, isLoading: packagesLoading, error: packagesError } = usePackages();
  const { getActiveFeatures, isLoading: featuresLoading } = usePayments();

  useEffect(() => {
    if (!listingId) {
      toast.error('No listing selected');
      router.push('/dashboard/listings');
    }
  }, [listingId, router]);

  useEffect(() => {
    loadActiveFeatures();
  }, []);

  const loadActiveFeatures = async () => {
    const features = await getActiveFeatures();
    if (features) {
      setActiveFeatures(features);
    }
  };

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackageId(packageId);
  };

  const handleContinueToCheckout = () => {
    if (!selectedPackageId) {
      toast.error('Please select a package');
      return;
    }

    router.push(`/dashboard/checkout?listingId=${listingId}&packageId=${selectedPackageId}`);
  };

  const isListingFeatured = activeFeatures.some(
    feature => feature.listingId === listingId && new Date(feature.expiresAt) > new Date()
  );

  if (packagesLoading || featuresLoading) {
    return (
      <div className="container max-w-6xl mx-auto p-6 space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (packagesError) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{packagesError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          Feature Your Listing
        </h1>
        <p className="text-muted-foreground">
          Get more visibility and sell your vehicle faster with our featured packages
        </p>
      </div>

      {/* Current Status Alert */}
      {isListingFeatured && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This listing is currently featured. You can extend or upgrade your featured status.
          </AlertDescription>
        </Alert>
      )}

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle>Why Feature Your Listing?</CardTitle>
          <CardDescription>
            Featured listings get significantly better results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">5x More Views</p>
                <p className="text-sm text-muted-foreground">
                  Featured listings get up to 5 times more visibility
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Sell 3x Faster</p>
                <p className="text-sm text-muted-foreground">
                  Featured vehicles sell 3 times faster on average
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Priority Placement</p>
                <p className="text-sm text-muted-foreground">
                  Appear at the top of search results
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Verified Badge</p>
                <p className="text-sm text-muted-foreground">
                  Build trust with the featured badge
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Package Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Choose Your Package</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              onSelect={handleSelectPackage}
              isSelected={selectedPackageId === pkg.id}
            />
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Package Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Feature</th>
                  <th className="text-center py-2 px-4">Basic</th>
                  <th className="text-center py-2 px-4">Standard</th>
                  <th className="text-center py-2 px-4">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4">Duration</td>
                  <td className="text-center py-2 px-4">7 days</td>
                  <td className="text-center py-2 px-4">14 days</td>
                  <td className="text-center py-2 px-4">30 days</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">Search Priority</td>
                  <td className="text-center py-2 px-4">✓</td>
                  <td className="text-center py-2 px-4">✓</td>
                  <td className="text-center py-2 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">Featured Badge</td>
                  <td className="text-center py-2 px-4">✓</td>
                  <td className="text-center py-2 px-4">✓</td>
                  <td className="text-center py-2 px-4">Premium</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">Homepage Showcase</td>
                  <td className="text-center py-2 px-4">-</td>
                  <td className="text-center py-2 px-4">✓</td>
                  <td className="text-center py-2 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">Social Media Promotion</td>
                  <td className="text-center py-2 px-4">-</td>
                  <td className="text-center py-2 px-4">-</td>
                  <td className="text-center py-2 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4">Email Blast Inclusion</td>
                  <td className="text-center py-2 px-4">-</td>
                  <td className="text-center py-2 px-4">-</td>
                  <td className="text-center py-2 px-4">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/listings')}
        >
          Back to Listings
        </Button>
        <Button
          size="lg"
          onClick={handleContinueToCheckout}
          disabled={!selectedPackageId}
        >
          Continue to Checkout
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}