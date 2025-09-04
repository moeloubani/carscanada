import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { UserUpdateValidator } from '../validators/user.validator';
import fs from 'fs/promises';
import path from 'path';

// Type for authenticated request
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

class UserController {
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await userService.getUserById(req.user.userId);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Validate update data
      const validation = UserUpdateValidator.validate(req.body);
      if (!validation.isValid) {
        res.status(400).json({ errors: validation.errors });
        return;
      }

      const updatedUser = await userService.updateUser(
        req.user.userId,
        validation.data
      );

      res.json({ 
        message: 'Profile updated successfully',
        user: updatedUser 
      });
    } catch (error) {
      console.error('Update profile error:', error);
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  async uploadAvatar(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      // Get current user to check for existing avatar
      const currentUser = await userService.getUserById(req.user.userId);
      
      // Delete old avatar if exists
      if (currentUser?.avatarUrl) {
        const oldPath = path.join(
          process.cwd(),
          'uploads',
          currentUser.avatarUrl.replace('/uploads/', '')
        );
        
        try {
          await fs.unlink(oldPath);
        } catch (err) {
          console.log('Failed to delete old avatar:', err);
        }
      }

      // Generate avatar URL
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      // Update user with new avatar URL
      const updatedUser = await userService.updateUser(
        req.user.userId,
        { avatarUrl }
      );

      res.json({ 
        message: 'Avatar uploaded successfully',
        avatarUrl: updatedUser.avatarUrl
      });
    } catch (error) {
      console.error('Upload avatar error:', error);
      
      // Clean up uploaded file on error
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (err) {
          console.log('Failed to delete uploaded file:', err);
        }
      }
      
      res.status(500).json({ error: 'Failed to upload avatar' });
    }
  }

  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Optional: Verify password before deletion
      const { password } = req.body;
      if (password) {
        const isValid = await userService.verifyPassword(
          req.user.userId,
          password
        );
        
        if (!isValid) {
          res.status(401).json({ error: 'Invalid password' });
          return;
        }
      }

      await userService.deleteUser(req.user.userId);

      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  }

  async getUserListings(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const result = await userService.getUserListings(
        req.user.userId,
        { page, limit, status }
      );

      res.json(result);
    } catch (error) {
      console.error('Get user listings error:', error);
      res.status(500).json({ error: 'Failed to get listings' });
    }
  }

  async getSavedListings(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await userService.getSavedListings(
        req.user.userId,
        { page, limit }
      );

      res.json(result);
    } catch (error) {
      console.error('Get saved listings error:', error);
      res.status(500).json({ error: 'Failed to get saved listings' });
    }
  }

  async saveListings(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { listingId } = req.body;

      if (!listingId) {
        res.status(400).json({ error: 'Listing ID is required' });
        return;
      }

      const savedListing = await userService.saveListing(
        req.user.userId,
        listingId
      );

      res.json({ 
        message: 'Listing saved successfully',
        savedListing 
      });
    } catch (error) {
      console.error('Save listing error:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Listing not found') {
          res.status(404).json({ error: 'Listing not found' });
          return;
        }
        if (error.message === 'Listing already saved') {
          res.status(409).json({ error: 'Listing already saved' });
          return;
        }
      }
      
      res.status(500).json({ error: 'Failed to save listing' });
    }
  }

  async unsaveListing(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { listingId } = req.params;

      if (!listingId) {
        res.status(400).json({ error: 'Listing ID is required' });
        return;
      }

      await userService.unsaveListing(req.user.userId, listingId);

      res.json({ message: 'Listing removed from saved' });
    } catch (error) {
      console.error('Unsave listing error:', error);
      
      if (error instanceof Error && error.message === 'Saved listing not found') {
        res.status(404).json({ error: 'Saved listing not found' });
        return;
      }
      
      res.status(500).json({ error: 'Failed to unsave listing' });
    }
  }
}

export const userController = new UserController();