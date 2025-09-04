import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { listings, PaginatedResponse, ApiError } from '@/lib/api';

export interface Listing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: string;
  fuelType: string;
  bodyType: string;
  drivetrain: string;
  color: string;
  condition: string;
  vin?: string;
  description: string;
  features: string[];
  images: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
  }>;
  location: {
    city: string;
    province: string;
    postalCode: string;
  };
  seller: {
    id: string;
    name: string;
    type: 'private' | 'dealer';
    phone?: string;
    dealership?: {
      id: string;
      name: string;
      logo?: string;
      rating?: number;
    };
  };
  views: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListingFilters {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  transmission?: string;
  fuelType?: string;
  bodyType?: string;
  drivetrain?: string;
  color?: string;
  condition?: string;
  province?: string;
  city?: string;
  dealerId?: string;
  sellerId?: string;
  search?: string;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export function useListings(
  filters?: ListingFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Listing>, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedResponse<Listing>, ApiError>({
    queryKey: ['listings', filters],
    queryFn: async () => {
      const response = await listings.getAll(filters);
      return response.data;
    },
    ...options,
  });
}

export function useSearchListings(
  searchParams: ListingFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Listing>, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedResponse<Listing>, ApiError>({
    queryKey: ['listings', 'search', searchParams],
    queryFn: async () => {
      const response = await listings.search(searchParams);
      return response.data;
    },
    enabled: !!searchParams.search || Object.keys(searchParams).length > 0,
    ...options,
  });
}

export function useFeaturedListings(
  limit: number = 6,
  options?: Omit<UseQueryOptions<PaginatedResponse<Listing>, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedResponse<Listing>, ApiError>({
    queryKey: ['listings', 'featured', limit],
    queryFn: async () => {
      const response = await listings.getAll({
        isFeatured: true,
        limit,
        sort: 'createdAt',
        order: 'desc',
      });
      return response.data;
    },
    ...options,
  });
}

export function useRecentListings(
  limit: number = 12,
  options?: Omit<UseQueryOptions<PaginatedResponse<Listing>, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedResponse<Listing>, ApiError>({
    queryKey: ['listings', 'recent', limit],
    queryFn: async () => {
      const response = await listings.getAll({
        limit,
        sort: 'createdAt',
        order: 'desc',
      });
      return response.data;
    },
    ...options,
  });
}

export function useDealerListings(
  dealerId: string,
  filters?: Omit<ListingFilters, 'dealerId'>,
  options?: Omit<UseQueryOptions<PaginatedResponse<Listing>, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedResponse<Listing>, ApiError>({
    queryKey: ['listings', 'dealer', dealerId, filters],
    queryFn: async () => {
      const response = await listings.getAll({
        ...filters,
        dealerId,
      });
      return response.data;
    },
    enabled: !!dealerId,
    ...options,
  });
}

export function useSimilarListings(
  listing: Partial<Listing>,
  limit: number = 6,
  options?: Omit<UseQueryOptions<PaginatedResponse<Listing>, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedResponse<Listing>, ApiError>({
    queryKey: ['listings', 'similar', listing.id, limit],
    queryFn: async () => {
      const response = await listings.search({
        make: listing.make,
        model: listing.model,
        minYear: listing.year ? listing.year - 2 : undefined,
        maxYear: listing.year ? listing.year + 2 : undefined,
        minPrice: listing.price ? listing.price * 0.8 : undefined,
        maxPrice: listing.price ? listing.price * 1.2 : undefined,
        limit,
      });
      // Filter out the current listing
      if (response.data.data && listing.id) {
        response.data.data = response.data.data.filter(l => l.id !== listing.id);
      }
      return response.data;
    },
    enabled: !!(listing.make && listing.model),
    ...options,
  });
}