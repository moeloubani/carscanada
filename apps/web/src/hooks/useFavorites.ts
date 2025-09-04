import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { user, favorites, PaginatedResponse, ApiError } from '@/lib/api';
import { toast } from 'sonner';
import { Listing } from './useListings';
import { useAuth } from '@/lib/auth';

export function useFavorites(
  page: number = 1,
  limit: number = 20,
  options?: Omit<UseQueryOptions<PaginatedResponse<Listing>, ApiError>, 'queryKey' | 'queryFn'>
) {
  const { user: currentUser, isAuthenticated } = useAuth();

  return useQuery<PaginatedResponse<Listing>, ApiError>({
    queryKey: ['favorites', page, limit],
    queryFn: async () => {
      const response = await user.getFavorites({ page, limit });
      return response.data;
    },
    enabled: isAuthenticated,
    ...options,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to save favorites');
      }
      const response = await favorites.add(listingId);
      return response.data;
    },
    onSuccess: (data, listingId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.setQueryData(['favorite-status', listingId], true);
      toast.success('Added to favorites!');
    },
    onError: (error: any) => {
      if (error.message === 'You must be logged in to save favorites') {
        toast.error(error.message);
      } else {
        toast.error(error.message || 'Failed to add to favorites');
      }
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to manage favorites');
      }
      const response = await favorites.remove(listingId);
      return response.data;
    },
    onSuccess: (data, listingId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.setQueryData(['favorite-status', listingId], false);
      toast.success('Removed from favorites');
    },
    onError: (error: any) => {
      if (error.message === 'You must be logged in to manage favorites') {
        toast.error(error.message);
      } else {
        toast.error(error.message || 'Failed to remove from favorites');
      }
    },
  });
}

export function useToggleFavorite() {
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const queryClient = useQueryClient();

  const toggleFavorite = async (listingId: string, isFavorite: boolean) => {
    if (isFavorite) {
      return removeFavorite.mutate(listingId);
    } else {
      return addFavorite.mutate(listingId);
    }
  };

  return {
    toggleFavorite,
    isLoading: addFavorite.isPending || removeFavorite.isPending,
  };
}

export function useIsFavorite(listingId: string) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['favorite-status', listingId],
    queryFn: async () => {
      if (!isAuthenticated) return false;
      
      // Check if the listing is in the user's favorites
      // This could be optimized by having a dedicated endpoint
      const response = await user.getFavorites({ limit: 100 });
      const favoriteIds = response.data.data.map(listing => listing.id);
      return favoriteIds.includes(listingId);
    },
    enabled: isAuthenticated && !!listingId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}