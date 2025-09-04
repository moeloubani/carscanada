import { Prisma, ListingStatus, ListingImage } from '@prisma/client';
import prisma from '../config/database';
import { uploadService } from './upload.service';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

interface CreateListingData {
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileageKm: number;
  vin?: string;
  bodyType: string;
  transmission: string;
  fuelType: string;
  drivetrain: string;
  exteriorColor: string;
  interiorColor?: string;
  engine?: string;
  description: string;
  condition: string;
  province: string;
  city: string;
  postalCode: string;
}

interface UpdateListingData extends Partial<CreateListingData> {}

interface ListingFilter {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  bodyType?: string;
  transmission?: string;
  fuelType?: string;
  province?: string;
  city?: string;
  searchQuery?: string;
  status?: ListingStatus;
  userId?: string;
  isFeatured?: boolean;
}

interface PaginationOptions {
  page: number;
  pageSize: number;
}

interface ListingImageData {
  imageUrl: string;
  thumbnailUrl?: string;
  position: number;
  isPrimary: boolean;
}

class ListingService {
  // Create a new listing
  async createListing(userId: string, data: CreateListingData) {
    try {
      // Calculate expiration date (60 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 60);

      const listing = await prisma.listing.create({
        data: {
          ...data,
          price: new Prisma.Decimal(data.price),
          userId,
          status: ListingStatus.ACTIVE,
          expiresAt,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              isDealer: true,
              dealerName: true,
              province: true,
              city: true,
            }
          },
          images: {
            orderBy: { position: 'asc' }
          }
        }
      });

      return listing;
    } catch (error) {
      throw new Error(`Failed to create listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update an existing listing
  async updateListing(listingId: string, userId: string, data: UpdateListingData) {
    try {
      // Check if listing exists and user owns it
      const existingListing = await prisma.listing.findFirst({
        where: {
          id: listingId,
          userId,
          status: {
            notIn: [ListingStatus.DELETED]
          }
        }
      });

      if (!existingListing) {
        throw new Error('Listing not found or you do not have permission to update it');
      }

      const updateData: any = { ...data };
      if (data.price !== undefined) {
        updateData.price = new Prisma.Decimal(data.price);
      }

      const listing = await prisma.listing.update({
        where: { id: listingId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              isDealer: true,
              dealerName: true,
              province: true,
              city: true,
            }
          },
          images: {
            orderBy: { position: 'asc' }
          }
        }
      });

      return listing;
    } catch (error) {
      throw new Error(`Failed to update listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete a listing (soft delete)
  async deleteListing(listingId: string, userId: string) {
    try {
      const existingListing = await prisma.listing.findFirst({
        where: {
          id: listingId,
          userId,
          status: {
            notIn: [ListingStatus.DELETED]
          }
        },
        include: {
          images: true
        }
      });

      if (!existingListing) {
        throw new Error('Listing not found or you do not have permission to delete it');
      }

      // Delete physical image files
      for (const image of existingListing.images) {
        if (image.imageUrl) {
          await uploadService.deleteFile(image.imageUrl);
        }
        if (image.thumbnailUrl) {
          await uploadService.deleteFile(image.thumbnailUrl);
        }
      }

      // Soft delete the listing
      const listing = await prisma.listing.update({
        where: { id: listingId },
        data: { status: ListingStatus.DELETED }
      });

      return listing;
    } catch (error) {
      throw new Error(`Failed to delete listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get a single listing by ID
  async getListingById(listingId: string, userId?: string) {
    try {
      const listing = await prisma.listing.findFirst({
        where: {
          id: listingId,
          status: {
            in: userId ? [ListingStatus.ACTIVE, ListingStatus.SOLD, ListingStatus.DRAFT] : [ListingStatus.ACTIVE, ListingStatus.SOLD]
          }
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              isDealer: true,
              dealerName: true,
              province: true,
              city: true,
            }
          },
          images: {
            orderBy: { position: 'asc' }
          },
          _count: {
            select: {
              savedBy: true,
              conversations: true
            }
          }
        }
      });

      if (!listing) {
        throw new Error('Listing not found');
      }

      // Check if user owns the listing or it's public
      if (listing.status === ListingStatus.DRAFT && listing.userId !== userId) {
        throw new Error('Listing not found');
      }

      return listing;
    } catch (error) {
      throw new Error(`Failed to get listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get listings with filters and pagination
  async getListings(filters: ListingFilter = {}, pagination: PaginationOptions) {
    try {
      const where: Prisma.ListingWhereInput = {
        status: filters.status || ListingStatus.ACTIVE,
      };

      // Apply filters
      if (filters.userId) where.userId = filters.userId;
      if (filters.make) where.make = { contains: filters.make, mode: 'insensitive' };
      if (filters.model) where.model = { contains: filters.model, mode: 'insensitive' };
      if (filters.yearMin || filters.yearMax) {
        where.year = {};
        if (filters.yearMin) where.year.gte = filters.yearMin;
        if (filters.yearMax) where.year.lte = filters.yearMax;
      }
      if (filters.priceMin || filters.priceMax) {
        where.price = {};
        if (filters.priceMin) where.price.gte = new Prisma.Decimal(filters.priceMin);
        if (filters.priceMax) where.price.lte = new Prisma.Decimal(filters.priceMax);
      }
      if (filters.mileageMax) where.mileageKm = { lte: filters.mileageMax };
      if (filters.bodyType) where.bodyType = filters.bodyType;
      if (filters.transmission) where.transmission = filters.transmission;
      if (filters.fuelType) where.fuelType = filters.fuelType;
      if (filters.province) where.province = filters.province;
      if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
      if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;

      // Search query across multiple fields
      if (filters.searchQuery) {
        where.OR = [
          { title: { contains: filters.searchQuery, mode: 'insensitive' } },
          { make: { contains: filters.searchQuery, mode: 'insensitive' } },
          { model: { contains: filters.searchQuery, mode: 'insensitive' } },
          { description: { contains: filters.searchQuery, mode: 'insensitive' } },
        ];
      }

      // Get total count for pagination
      const totalCount = await prisma.listing.count({ where });

      // Get paginated listings
      const listings = await prisma.listing.findMany({
        where,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              isDealer: true,
              dealerName: true,
              province: true,
              city: true,
            }
          },
          images: {
            where: { isPrimary: true },
            take: 1
          },
          _count: {
            select: {
              savedBy: true,
              conversations: true
            }
          }
        }
      });

      return {
        listings,
        pagination: {
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pagination.pageSize)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get listings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Upload images for a listing
  async uploadListingImages(
    listingId: string,
    userId: string,
    files: Express.Multer.File[]
  ): Promise<ListingImage[]> {
    try {
      // Verify listing ownership
      const listing = await prisma.listing.findFirst({
        where: {
          id: listingId,
          userId,
          status: { notIn: [ListingStatus.DELETED] }
        },
        include: { images: true }
      });

      if (!listing) {
        throw new Error('Listing not found or you do not have permission to modify it');
      }

      // Check image limit (max 20 images per listing)
      const existingImageCount = listing.images.length;
      if (existingImageCount + files.length > 20) {
        throw new Error(`Cannot upload more than 20 images per listing. Current count: ${existingImageCount}`);
      }

      const uploadedImages: ListingImage[] = [];
      const startPosition = existingImageCount;

      // Process and upload each image
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const position = startPosition + i;
        const isPrimary = existingImageCount === 0 && i === 0; // First image becomes primary if no existing images

        // Generate thumbnail
        const thumbnailFilename = `thumb-${path.basename(file.filename)}`;
        const thumbnailPath = path.join(process.cwd(), 'uploads', 'listings', thumbnailFilename);

        try {
          await sharp(file.path)
            .resize(400, 300, {
              fit: 'cover',
              position: 'center'
            })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);
        } catch (error) {
          console.error('Failed to create thumbnail:', error);
        }

        // Create database record
        const image = await prisma.listingImage.create({
          data: {
            listingId,
            imageUrl: uploadService.getPublicUrl(file.filename, 'listing'),
            thumbnailUrl: uploadService.getPublicUrl(thumbnailFilename, 'listing'),
            position,
            isPrimary
          }
        });

        uploadedImages.push(image);
      }

      return uploadedImages;
    } catch (error) {
      // Clean up uploaded files on error
      for (const file of files) {
        await uploadService.deleteFile(file.path);
      }
      throw new Error(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete a listing image
  async deleteListingImage(listingId: string, imageId: string, userId: string) {
    try {
      // Verify listing ownership
      const listing = await prisma.listing.findFirst({
        where: {
          id: listingId,
          userId,
          status: { notIn: [ListingStatus.DELETED] }
        },
        include: { images: true }
      });

      if (!listing) {
        throw new Error('Listing not found or you do not have permission to modify it');
      }

      const image = listing.images.find(img => img.id === imageId);
      if (!image) {
        throw new Error('Image not found');
      }

      // Delete physical files
      if (image.imageUrl) {
        await uploadService.deleteFile(image.imageUrl);
      }
      if (image.thumbnailUrl) {
        await uploadService.deleteFile(image.thumbnailUrl);
      }

      // Delete database record
      await prisma.listingImage.delete({
        where: { id: imageId }
      });

      // If this was the primary image, make the first remaining image primary
      if (image.isPrimary && listing.images.length > 1) {
        const remainingImages = listing.images
          .filter(img => img.id !== imageId)
          .sort((a, b) => a.position - b.position);

        if (remainingImages.length > 0) {
          await prisma.listingImage.update({
            where: { id: remainingImages[0].id },
            data: { isPrimary: true }
          });
        }
      }

      // Reorder remaining images
      const remainingImages = await prisma.listingImage.findMany({
        where: { listingId },
        orderBy: { position: 'asc' }
      });

      for (let i = 0; i < remainingImages.length; i++) {
        if (remainingImages[i].position !== i) {
          await prisma.listingImage.update({
            where: { id: remainingImages[i].id },
            data: { position: i }
          });
        }
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Reorder listing images
  async reorderListingImages(listingId: string, userId: string, imageIds: string[]) {
    try {
      // Verify listing ownership
      const listing = await prisma.listing.findFirst({
        where: {
          id: listingId,
          userId,
          status: { notIn: [ListingStatus.DELETED] }
        },
        include: { images: true }
      });

      if (!listing) {
        throw new Error('Listing not found or you do not have permission to modify it');
      }

      // Verify all image IDs belong to this listing
      const listingImageIds = listing.images.map(img => img.id);
      const validImageIds = imageIds.every(id => listingImageIds.includes(id));
      
      if (!validImageIds || imageIds.length !== listingImageIds.length) {
        throw new Error('Invalid image IDs provided');
      }

      // Update positions
      const updates = imageIds.map((imageId, index) =>
        prisma.listingImage.update({
          where: { id: imageId },
          data: { position: index }
        })
      );

      await prisma.$transaction(updates);

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to reorder images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Set primary image
  async setPrimaryImage(listingId: string, imageId: string, userId: string) {
    try {
      // Verify listing ownership
      const listing = await prisma.listing.findFirst({
        where: {
          id: listingId,
          userId,
          status: { notIn: [ListingStatus.DELETED] }
        },
        include: { images: true }
      });

      if (!listing) {
        throw new Error('Listing not found or you do not have permission to modify it');
      }

      const image = listing.images.find(img => img.id === imageId);
      if (!image) {
        throw new Error('Image not found');
      }

      // Update all images in a transaction
      await prisma.$transaction([
        // Remove primary flag from all images
        prisma.listingImage.updateMany({
          where: { listingId },
          data: { isPrimary: false }
        }),
        // Set new primary image
        prisma.listingImage.update({
          where: { id: imageId },
          data: { isPrimary: true }
        })
      ]);

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to set primary image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Mark listing as sold
  async markListingAsSold(listingId: string, userId: string) {
    try {
      const listing = await prisma.listing.findFirst({
        where: {
          id: listingId,
          userId,
          status: ListingStatus.ACTIVE
        }
      });

      if (!listing) {
        throw new Error('Listing not found or you do not have permission to modify it');
      }

      const updatedListing = await prisma.listing.update({
        where: { id: listingId },
        data: { status: ListingStatus.SOLD },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              isDealer: true,
              dealerName: true,
            }
          },
          images: {
            orderBy: { position: 'asc' }
          }
        }
      });

      return updatedListing;
    } catch (error) {
      throw new Error(`Failed to mark listing as sold: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Track listing view
  async trackListingView(listingId: string, viewerId?: string) {
    try {
      // Don't count views from the listing owner
      if (viewerId) {
        const listing = await prisma.listing.findFirst({
          where: {
            id: listingId,
            userId: viewerId
          }
        });

        if (listing) {
          return { success: false, message: 'Owner views are not counted' };
        }
      }

      await prisma.listing.update({
        where: { id: listingId },
        data: { viewsCount: { increment: 1 } }
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to track view:', error);
      return { success: false };
    }
  }

  // Make listing featured (requires payment)
  async makeListingFeatured(listingId: string, userId: string, durationDays: number = 30) {
    try {
      const listing = await prisma.listing.findFirst({
        where: {
          id: listingId,
          userId,
          status: ListingStatus.ACTIVE
        }
      });

      if (!listing) {
        throw new Error('Listing not found or you do not have permission to modify it');
      }

      const featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + durationDays);

      const updatedListing = await prisma.listing.update({
        where: { id: listingId },
        data: {
          isFeatured: true,
          featuredUntil
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              isDealer: true,
              dealerName: true,
            }
          },
          images: {
            orderBy: { position: 'asc' }
          }
        }
      });

      return updatedListing;
    } catch (error) {
      throw new Error(`Failed to make listing featured: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user's listings
  async getUserListings(userId: string, viewerId?: string, pagination: PaginationOptions) {
    try {
      const where: Prisma.ListingWhereInput = {
        userId,
        status: {
          in: userId === viewerId 
            ? [ListingStatus.ACTIVE, ListingStatus.SOLD, ListingStatus.DRAFT, ListingStatus.EXPIRED]
            : [ListingStatus.ACTIVE, ListingStatus.SOLD]
        }
      };

      const totalCount = await prisma.listing.count({ where });

      const listings = await prisma.listing.findMany({
        where,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          images: {
            where: { isPrimary: true },
            take: 1
          },
          _count: {
            select: {
              savedBy: true,
              conversations: true
            }
          }
        }
      });

      return {
        listings,
        pagination: {
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pagination.pageSize)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get user listings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check and expire old listings
  async expireOldListings() {
    try {
      const now = new Date();
      
      const expiredListings = await prisma.listing.updateMany({
        where: {
          status: ListingStatus.ACTIVE,
          expiresAt: { lte: now }
        },
        data: { status: ListingStatus.EXPIRED }
      });

      // Remove featured status from expired featured listings
      await prisma.listing.updateMany({
        where: {
          isFeatured: true,
          featuredUntil: { lte: now }
        },
        data: {
          isFeatured: false,
          featuredUntil: null
        }
      });

      return expiredListings;
    } catch (error) {
      console.error('Failed to expire old listings:', error);
    }
  }
}

export const listingService = new ListingService();