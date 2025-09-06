'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ListingForm } from '@/components/forms/ListingForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { listings as listingsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [listingData, setListingData] = useState<any>(null);

  useEffect(() => {
    fetchListingData();
  }, [params.id]);

  const fetchListingData = async () => {
    try {
      setFetchingData(true);
      const response = await listingsApi.getOne(params.id);
      setListingData(response.data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load listing data',
      });
      router.push('/dashboard/listings');
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async (data: any, isDraft: boolean = false) => {
    try {
      setLoading(true);
      
      // Create FormData for file upload if there are new images
      const hasNewImages = data.images.some((img: any) => img instanceof File);
      
      if (hasNewImages) {
        const formData = new FormData();
        
        // Add all non-file fields
        Object.keys(data).forEach(key => {
          if (key !== 'images') {
            if (typeof data[key] === 'object') {
              formData.append(key, JSON.stringify(data[key]));
            } else {
              formData.append(key, data[key]);
            }
          }
        });
        
        // Add images
        data.images.forEach((image: File | string) => {
          if (image instanceof File) {
            formData.append('images', image);
          } else {
            formData.append('existingImages', image);
          }
        });
        
        formData.append('status', isDraft ? 'draft' : 'active');
        
        await listingsApi.update(params.id, formData);
      } else {
        // No new images, send as JSON
        await listingsApi.update(params.id, {
          ...data,
          status: isDraft ? 'draft' : 'active',
        });
      }
      
      toast({
        title: 'Success',
        description: 'Listing updated successfully',
      });
      
      router.push('/dashboard/listings');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update listing',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Listing</h1>
        <p className="text-muted-foreground mt-2">
          Update your vehicle listing details
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
          <CardDescription>
            Update your vehicle information to keep your listing current
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListingForm
            initialData={listingData}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}