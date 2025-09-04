import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { uploadAvatar, handleUploadError } from '../middleware/upload';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// Middleware to handle multer errors
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    const errorMessage = handleUploadError(err);
    return res.status(400).json({ error: errorMessage });
  }
  next();
};

// Get current user profile
router.get('/profile', authenticate, userController.getProfile);

// Update user profile
router.put('/profile', authenticate, userController.updateProfile);

// Upload avatar image
router.post(
  '/avatar',
  authenticate,
  uploadAvatar.single('avatar'),
  handleMulterError,
  userController.uploadAvatar
);

// Delete user account
router.delete('/account', authenticate, userController.deleteAccount);

// Get user's own listings
router.get('/listings', authenticate, userController.getUserListings);

// Get saved/favorite listings
router.get('/saved', authenticate, userController.getSavedListings);

// Save a listing
router.post('/saved', authenticate, userController.saveListings);

// Unsave a listing
router.delete('/saved/:listingId', authenticate, userController.unsaveListing);

export default router;