'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useListing } from '@/hooks/useListing';
import { usePayments } from '@/hooks/usePayments';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Home, 
  FileText,
  Mail,
  Clock,
  TrendingUp 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId');
  const sessionId = searchParams.get('session_id');
  
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [featuredUntil, setFeaturedUntil] = useState<string | null>(null);
  
  const { listing } = useListing(listingId || '');
  const { confirmPayment, getActiveFeatures } = usePayments();

  useEffect(() => {
    // Trigger celebration animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Confirm payment if session_id is present (Stripe redirect)
    if (sessionId) {
      handleStripeRedirect();
    } else {
      // Direct success from embedded checkout
      loadPaymentDetails();
    }
  }, [sessionId]);

  const handleStripeRedirect = async () => {
    if (!sessionId) return;
    
    const confirmed = await confirmPayment(sessionId);
    if (confirmed) {
      loadPaymentDetails();
    }
  };

  const loadPaymentDetails = async () => {
    const features = await getActiveFeatures();
    if (features && listingId) {
      const feature = features.find((f: any) => f.listingId === listingId);
      if (feature) {
        setFeaturedUntil(feature.expiresAt);
        setPaymentDetails(feature);
      }
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <CheckCircle2 className="h-20 w-20 text-green-600" />
            <Sparkles className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Payment Successful!</h1>
        <p className="text-muted-foreground text-lg">
          Your listing is now featured and will receive premium visibility
        </p>
      </div>

      {/* Transaction Details */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>
            Your payment has been processed successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {listing && (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Listing</span>
                <span className="font-medium">{listing.title}</span>
              </div>
              {paymentDetails && (
                <>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Package</span>
                    <Badge variant="secondary">{paymentDetails.packageName}</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-medium">${paymentDetails.amount?.toFixed(2)} CAD</span>
                  </div>
                </>
              )}
              {featuredUntil && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Featured Until</span>
                  <span className="font-medium">
                    {new Date(featuredUntil).toLocaleDateString('en-CA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-sm">
                  {sessionId || paymentDetails?.id || 'N/A'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* What's Next */}
      <Card>
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
          <CardDescription>
            Your featured listing is now live with these benefits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Increased Visibility</p>
                <p className="text-sm text-muted-foreground">
                  Your listing will appear at the top of search results
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Featured Badge</p>
                <p className="text-sm text-muted-foreground">
                  A special badge shows buyers this is a premium listing
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Email Confirmation</p>
                <p className="text-sm text-muted-foreground">
                  You'll receive a receipt and details via email
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Duration Tracking</p>
                <p className="text-sm text-muted-foreground">
                  We'll notify you before your featured status expires
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Notice */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          A detailed receipt has been sent to your registered email address. 
          You can also view your payment history in your account settings.
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          size="lg"
          onClick={() => router.push(`/dashboard/listings/${listingId}`)}
        >
          View Featured Listing
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => router.push('/dashboard')}
        >
          <Home className="mr-2 h-4 w-4" />
          Go to Dashboard
        </Button>
      </div>

      {/* Tips Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Tips to Maximize Your Featured Listing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-blue-800">
          <p className="flex items-start gap-2">
            <span className="font-semibold">1.</span>
            Keep your listing updated with accurate information
          </p>
          <p className="flex items-start gap-2">
            <span className="font-semibold">2.</span>
            Add high-quality photos from multiple angles
          </p>
          <p className="flex items-start gap-2">
            <span className="font-semibold">3.</span>
            Respond quickly to inquiries from potential buyers
          </p>
          <p className="flex items-start gap-2">
            <span className="font-semibold">4.</span>
            Consider adjusting your price if you don't receive inquiries
          </p>
        </CardContent>
      </Card>
    </div>
  );
}