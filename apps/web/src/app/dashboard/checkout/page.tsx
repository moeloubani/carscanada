'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StripeCheckout } from '@/components/payment/StripeCheckout';
import { PriceBreakdown } from '@/components/payment/PriceBreakdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { usePackages } from '@/hooks/usePackages';
import { usePayments } from '@/hooks/usePayments';
import { useListing } from '@/hooks/useListing';
import { ArrowLeft, Car, MapPin, Calendar, Info } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId');
  const packageId = searchParams.get('packageId');

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const { getPackageById } = usePackages();
  const { createCheckoutSession, confirmPayment } = usePayments();
  const { listing, isLoading: listingLoading, error: listingError } = useListing(listingId || '');

  const selectedPackage = packageId ? getPackageById(packageId) : null;

  useEffect(() => {
    if (!listingId || !packageId) {
      toast.error('Missing required information');
      router.push('/dashboard/listings');
      return;
    }

    if (!selectedPackage) {
      toast.error('Invalid package selected');
      router.push(`/dashboard/featured?listingId=${listingId}`);
      return;
    }

    initializeCheckout();
  }, [listingId, packageId, selectedPackage]);

  const initializeCheckout = async () => {
    if (!listingId || !packageId) return;

    const session = await createCheckoutSession(packageId, listingId);
    if (session) {
      setClientSecret(session.clientSecret);
      setSessionId(session.sessionId);
    } else {
      toast.error('Failed to initialize checkout');
    }
  };

  const handlePaymentSuccess = async () => {
    if (!sessionId) {
      toast.error('No payment session found');
      return;
    }

    const confirmed = await confirmPayment(sessionId);
    if (confirmed) {
      router.push(`/dashboard/payment/success?listingId=${listingId}`);
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  if (listingLoading || !selectedPackage) {
    return (
      <div className="container max-w-6xl mx-auto p-6 space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-96" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (listingError) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{listingError}</AlertDescription>
        </Alert>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => router.push('/dashboard/listings')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/dashboard/featured?listingId=${listingId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Complete Your Purchase</h1>
          <p className="text-muted-foreground">
            Feature your listing and reach more buyers
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Listing Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Listing Being Featured</CardTitle>
              <CardDescription>
                This is the listing that will be featured
              </CardDescription>
            </CardHeader>
            <CardContent>
              {listing && (
                <div className="flex gap-4">
                  {listing.images?.[0] && (
                    <div className="relative w-32 h-24 flex-shrink-0">
                      <Image
                        src={listing.images[0].url}
                        alt={listing.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="font-semibold">{listing.title}</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        ${listing.price.toLocaleString()} CAD
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Car className="h-3 w-3" />
                        <span>{listing.make} {listing.model}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{listing.year}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{listing.location.city}, {listing.location.province}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Package Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Package</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedPackage.name} Package
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPackage.duration} days of featured visibility
                    </p>
                  </div>
                  <Badge variant="secondary">
                    ${selectedPackage.price} CAD
                  </Badge>
                </div>
                <ul className="space-y-2 text-sm">
                  {selectedPackage.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          {clientSecret ? (
            <StripeCheckout
              clientSecret={clientSecret}
              amount={selectedPackage.price}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Skeleton className="h-8 w-48 mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Initializing secure checkout...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your payment information is secure and encrypted. We never store your card details.
              All payments are processed through Stripe.
            </AlertDescription>
          </Alert>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <PriceBreakdown
            packageName={selectedPackage.name}
            duration={selectedPackage.duration}
            price={selectedPackage.price}
            discount={selectedPackage.originalPrice ? selectedPackage.originalPrice - selectedPackage.price : 0}
          />

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                Contact our support team:
              </p>
              <p className="font-medium">support@carscanada.ca</p>
              <p className="font-medium">1-800-CARS-CAN</p>
              <p className="text-muted-foreground">
                Available Mon-Fri, 9am-5pm EST
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}