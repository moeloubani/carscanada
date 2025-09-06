'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  X, 
  Image as ImageIcon,
  AlertCircle,
  Move
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  value: File[] | string[];
  onChange: (files: File[] | string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageUploader({ 
  value = [], 
  onChange, 
  maxImages = 20,
  disabled = false 
}: ImageUploaderProps) {
  const { toast } = useToast();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const totalImages = value.length + acceptedFiles.length;
    
    if (totalImages > maxImages) {
      toast({
        variant: 'destructive',
        title: 'Too many images',
        description: `You can only upload up to ${maxImages} images`,
      });
      return;
    }

    const validFiles = acceptedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: `${file.name} exceeds the 10MB limit`,
        });
        return false;
      }
      
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: `${file.name} is not a supported image format`,
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      // Type guard to handle both File[] and string[] types
      if (value.length > 0 && typeof value[0] === 'string') {
        // If existing values are strings (URLs), we can't mix them with Files
        // This shouldn't happen in practice as we're either working with Files or URLs
        console.warn('Cannot mix URL strings with File objects');
        return;
      }
      onChange([...value, ...validFiles] as File[]);
    }
  }, [value, onChange, maxImages, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: MAX_FILE_SIZE,
    disabled,
  });

  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages as typeof value);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...value];
    const draggedImage = newImages[draggedIndex];
    
    // Remove from old position
    newImages.splice(draggedIndex, 1);
    // Insert at new position
    newImages.splice(index, 0, draggedImage);
    
    onChange(newImages as typeof value);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getImageUrl = (image: File | string): string => {
    if (typeof image === 'string') {
      return image;
    }
    return URL.createObjectURL(image);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          !isDragActive && !disabled && "hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-muted rounded-full">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">
              {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Supports JPEG, PNG, WebP up to 10MB each
          </p>
          {maxImages && (
            <p className="text-xs text-muted-foreground">
              {value.length}/{maxImages} images uploaded
            </p>
          )}
        </div>
      </div>

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((image, index) => (
            <Card
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative group overflow-hidden cursor-move",
                draggedIndex === index && "opacity-50"
              )}
            >
              <div className="aspect-square relative">
                <img
                  src={getImageUrl(image)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Main Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Main
                    </span>
                  </div>
                )}
                
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Drag Handle */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 rounded p-1">
                    <Move className="h-4 w-4 text-gray-700" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Instructions */}
      {value.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p>Drag images to reorder. The first image will be the main photo.</p>
            <p>Upload high-quality images from different angles for better results.</p>
          </div>
        </div>
      )}
    </div>
  );
}