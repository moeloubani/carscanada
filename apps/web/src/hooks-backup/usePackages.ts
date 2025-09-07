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
        setPackages(FEATURED_PACKAGES.map(pkg => ({...pkg, features: [...pkg.features]})));
      }
    } catch (err) {
      // If API fails, use constants as fallback
      setPackages(FEATURED_PACKAGES.map(pkg => ({...pkg, features: [...pkg.features]})));
      // Don't show error since we have fallback data
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