'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListingForm } from '@/components/forms/ListingForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { listings as listingsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function CreateListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any, isDraft: boolean = false) => {
    try {
      setLoading(true);
      
      // Create FormData for file upload
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
      if (data.images && data.images.length > 0) {
        data.images.forEach((image: File) => {
          formData.append('images', image);
        });
      }
      
      // Add status
      formData.append('status', isDraft ? 'draft' : 'active');
      
      await listingsApi.create(formData);
      
      toast({
        title: 'Success',
        description: isDraft ? 'Listing saved as draft' : 'Listing published successfully',
      });
      
      router.push('/dashboard/listings');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create listing',
      });
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold tracking-tight">Create New Listing</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the details below to create your vehicle listing
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
          <CardDescription>
            Provide accurate information about your vehicle to attract potential buyers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListingForm
            onSubmit={handleSubmit}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}