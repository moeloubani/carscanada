import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { listings, ApiError } from '@/lib/api';
import { toast } from 'sonner';
import { Listing } from './useListings';

export function useListing(
  id: string,
  options?: Omit<UseQueryOptions<Listing, ApiError>, 'queryKey' | 'queryFn'>
) {
  const query = useQuery<Listing, ApiError>({
    queryKey: ['listing', id],
    queryFn: async () => {
      const response = await listings.getOne(id);
      return response.data;
    },
    enabled: !!id,
    ...options,
  });

  return {
    listing: query.data,
    isLoading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  };
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await listings.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Listing created successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create listing');
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData | any }) => {
      const response = await listings.update(id, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['listing', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Listing updated successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to update listing');
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await listings.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Listing deleted successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to delete listing');
    },
  });
}

export function useFeatureListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await listings.feature(id);
      return response.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Listing featured successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to feature listing');
    },
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await listings.uploadImage(file);
      return response.data;
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to upload image');
    },
  });
}

export function useDeleteImage() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await listings.deleteImage(id);
      return response.data;
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to delete image');
    },
  });
}