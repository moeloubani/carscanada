import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { payments } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { toast } from 'sonner';

export interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  packageId: string;
  packageName: string;
  listingId: string;
  listingTitle: string;
  createdAt: string;
  featuredUntil?: string;
}

export interface CheckoutSession {
  sessionId: string;
  clientSecret: string;
  amount: number;
  currency: string;
}

export function usePayments() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = useCallback(
    async (packageId: string, listingId: string): Promise<CheckoutSession | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await payments.createCheckoutSession({
          packageId,
          listingId,
        });

        return response.data;
      } catch (err) {
        const error = err as ApiError;
        const message = error.message || 'Failed to create checkout session';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const confirmPayment = useCallback(
    async (sessionId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        await payments.confirmPayment(sessionId);
        toast.success('Payment successful! Your listing is now featured.');
        return true;
      } catch (err) {
        const error = err as ApiError;
        const message = error.message || 'Failed to confirm payment';
        setError(message);
        toast.error(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getPaymentHistory = useCallback(
    async (page = 1, limit = 10) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await payments.getPaymentHistory({ page, limit });
        return response.data;
      } catch (err) {
        const error = err as ApiError;
        const message = error.message || 'Failed to fetch payment history';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getActiveFeatures = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await payments.getActiveFeatures();
      return response.data;
    } catch (err) {
      const error = err as ApiError;
      const message = error.message || 'Failed to fetch active features';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createCheckoutSession,
    confirmPayment,
    getPaymentHistory,
    getActiveFeatures,
    isLoading,
    error,
  };
}