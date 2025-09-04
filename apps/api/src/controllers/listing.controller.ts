import { Request, Response, NextFunction } from 'express';
import { listingService } from '../services/listing.service';
import { 
  CreateListingInput, 
  UpdateListingInput, 
  ListingFiltersInput 
} from '@carscanada/validators';
import { handleUploadError } from '../middleware/upload';

class ListingController {
  // Get all listings with filters and pagination
  async getListings(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: ListingFiltersInput = {
        make: req.query.make as string,
        model: req.query.model as string,
        yearMin: req.query.yearMin ? parseInt(req.query.yearMin as string) : undefined,
        yearMax: req.query.yearMax ? parseInt(req.query.yearMax as string) : undefined,
        priceMin: req.query.priceMin ? parseFloat(req.query.priceMin as string) : undefined,
        priceMax: req.query.priceMax ? parseFloat(req.query.priceMax as string) : undefined,
        mileageMax: req.query.mileageMax ? parseInt(req.query.mileageMax as string) : undefined,
        bodyType: req.query.bodyType as string,
        transmission: req.query.transmission as string,
        fuelType: req.query.fuelType as string,
        province: req.query.province as string,
        city: req.query.city as string,
        searchQuery: req.query.searchQuery as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 20,
      };

      const result = await listingService.getListings(filters, {
        page: filters.page || 1,
        pageSize: Math.min(filters.pageSize || 20, 100) // Max 100 per page
      });

      res.json({
        success: true,
        data: result.listings,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // Get a single listing by ID
  async getListingById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const listing = await listingService.getListingById(id, userId);

      res.json({
        success: true,
        data: listing
      });
    } catch (error) {
      next(error);
    }
  }

  // Create a new listing
  async createListing(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const data: CreateListingInput = req.body;
      const listing = await listingService.createListing(req.user.userId, data);

      res.status(201).json({
        success: true,
        data: listing
      });
    } catch (error) {
      next(error);
    }
  }

  // Update a listing
  async updateListing(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const data: UpdateListingInput = req.body;

      const listing = await listingService.updateListing(id, req.user.userId, data);

      res.json({
        success: true,
        data: listing
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete a listing
  async deleteListing(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      await listingService.deleteListing(id, req.user.userId);

      res.json({
        success: true,
        message: 'Listing deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Upload images to a listing
  async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ success: false, error: 'No images provided' });
        return;
      }

      const images = await listingService.uploadListingImages(id, req.user.userId, files);

      res.json({
        success: true,
        data: images
      });
    } catch (error) {
      // Handle multer errors
      if (error && typeof error === 'object' && 'code' in error) {
        const errorMessage = handleUploadError(error);
        res.status(400).json({ success: false, error: errorMessage });
        return;
      }
      next(error);
    }
  }

  // Delete an image from a listing
  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const { id, imageId } = req.params;
      await listingService.deleteListingImage(id, imageId, req.user.userId);

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Reorder listing images
  async reorderImages(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const { imageIds } = req.body;

      if (!Array.isArray(imageIds) || imageIds.length === 0) {
        res.status(400).json({ success: false, error: 'Invalid image IDs provided' });
        return;
      }

      await listingService.reorderListingImages(id, req.user.userId, imageIds);

      res.json({
        success: true,
        message: 'Images reordered successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Set primary image
  async setPrimaryImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const { id, imageId } = req.params;
      await listingService.setPrimaryImage(id, imageId, req.user.userId);

      res.json({
        success: true,
        message: 'Primary image set successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark listing as sold
  async markAsSold(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const listing = await listingService.markListingAsSold(id, req.user.userId);

      res.json({
        success: true,
        data: listing
      });
    } catch (error) {
      next(error);
    }
  }

  // Track listing view
  async trackView(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const viewerId = req.user?.userId;

      const result = await listingService.trackListingView(id, viewerId);

      res.json({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // Make listing featured
  async makeListingFeatured(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const { durationDays = 30 } = req.body;

      // TODO: Integrate with payment service before making featured
      // This should only be called after successful payment

      const listing = await listingService.makeListingFeatured(id, req.user.userId, durationDays);

      res.json({
        success: true,
        data: listing
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user's listings
  async getUserListings(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const viewerId = req.user?.userId;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;

      const result = await listingService.getUserListings(userId, viewerId, {
        page,
        pageSize: Math.min(pageSize, 100)
      });

      res.json({
        success: true,
        data: result.listings,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // Get my listings (authenticated user)
  async getMyListings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 20;

      const result = await listingService.getUserListings(req.user.userId, req.user.userId, {
        page,
        pageSize: Math.min(pageSize, 100)
      });

      res.json({
        success: true,
        data: result.listings,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
}

export const listingController = new ListingController();