import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { uploadListingImages } from '../middleware/upload';
import { listingController } from '../controllers/listing.controller';
import {
  validateCreateListing,
  validateUpdateListing,
  validateListingFilters,
  validateImageIds,
  validateFeaturedListing,
  listingEnums
} from '../validators/listing.validator';

const router = Router();

// Public routes
// Get all listings with filters and pagination
router.get('/', 
  validateListingFilters,
  listingController.getListings
);

// Get listing enums (for frontend dropdowns)
router.get('/enums', (req, res) => {
  res.json({
    success: true,
    data: listingEnums
  });
});

// Get my listings (authenticated user) - must come before /:id
router.get('/my/listings',
  authenticate,
  listingController.getMyListings
);

// Get user's public listings
router.get('/user/:userId',
  optionalAuth,
  listingController.getUserListings
);

// Get a single listing by ID
router.get('/:id', 
  optionalAuth,
  listingController.getListingById
);

// Track listing view
router.post('/:id/view',
  optionalAuth,
  listingController.trackView
);

// Protected routes - require authentication
// Create new listing
router.post('/',
  authenticate,
  validateCreateListing,
  listingController.createListing
);

// Update listing
router.put('/:id',
  authenticate,
  validateUpdateListing,
  listingController.updateListing
);

// Delete listing
router.delete('/:id',
  authenticate,
  listingController.deleteListing
);

// Upload images to listing (max 20 images)
router.post('/:id/images',
  authenticate,
  uploadListingImages.array('images', 20),
  listingController.uploadImages
);

// Delete image from listing
router.delete('/:id/images/:imageId',
  authenticate,
  listingController.deleteImage
);

// Reorder listing images
router.put('/:id/images/reorder',
  authenticate,
  validateImageIds,
  listingController.reorderImages
);

// Set primary image
router.put('/:id/images/:imageId/primary',
  authenticate,
  listingController.setPrimaryImage
);

// Mark listing as sold
router.post('/:id/mark-sold',
  authenticate,
  listingController.markAsSold
);

// Make listing featured (requires payment)
router.post('/:id/feature',
  authenticate,
  validateFeaturedListing,
  listingController.makeListingFeatured
);

export default router;