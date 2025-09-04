import { useState, useEffect } from 'react';
import { payments } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { FEATURED_PACKAGES } from '@/lib/constants';

export interface FeaturedPackage {
  id: string;
  name: string;
  duration: number;
  price: number;
  originalPrice?: number;
  popular?: boolean;
  features: string[];
}

export function usePackages() {
  const [packages, setPackages] = useState<FeaturedPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch from API first
      const response = await payments.getPackages();
      if (response.data && response.data.length > 0) {
        setPackages(response.data);
      } else {
        // Fallback to constants if API doesn't return packages
        setPackages(FEATURED_PACKAGES as FeaturedPackage[]);
      }
    } catch (err) {
      // If API fails, use constants as fallback
      setPackages(FEATURED_PACKAGES as FeaturedPackage[]);
      const error = err as ApiError;
      // Don't show error if we have fallback data
      if (!FEATURED_PACKAGES || FEATURED_PACKAGES.length === 0) {
        setError(error.message || 'Failed to fetch packages');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPackageById = (id: string): FeaturedPackage | undefined => {
    return packages.find(pkg => pkg.id === id);
  };

  return {
    packages,
    isLoading,
    error,
    getPackageById,
    refetch: fetchPackages,
  };
}