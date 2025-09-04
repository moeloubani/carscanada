import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { uploadService } from '../services/upload.service';

// Configure storage for avatars
const avatarStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
    await uploadService.ensureDirectories();
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = uploadService.generateUniqueFilename(file.originalname);
    cb(null, uniqueFilename);
  }
});

// Configure storage for listing images
const listingStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'listings');
    // Ensure directory exists
    await uploadService.ensureDirectories();
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = uploadService.generateUniqueFilename(file.originalname);
    cb(null, uniqueFilename);
  }
});

// File filter for images
const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check file extension
  if (!uploadService.isValidImageExtension(file.originalname)) {
    return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }

  // Check MIME type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only images are allowed.'));
  }

  cb(null, true);
};

// Avatar upload configuration
export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for avatars
    files: 1 // Only one file at a time
  }
});

// Listing images upload configuration
export const uploadListingImages = multer({
  storage: listingStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per listing image
    files: 20 // Maximum 20 images per upload request
  }
});

// Memory storage for processing before saving
export const uploadToMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 20 // Maximum 20 images
  }
});

// Error handler for multer errors
export const handleUploadError = (error: any): string => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return 'File size too large';
      case 'LIMIT_FILE_COUNT':
        return 'Too many files';
      case 'LIMIT_UNEXPECTED_FILE':
        return 'Unexpected field name';
      default:
        return 'Upload error occurred';
    }
  } else if (error?.message) {
    return error.message;
  }
  return 'Unknown upload error';
};