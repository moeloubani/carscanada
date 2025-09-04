import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

class UploadService {
  private uploadsDir = path.join(process.cwd(), 'uploads');
  private avatarsDir = path.join(this.uploadsDir, 'avatars');
  private listingsDir = path.join(this.uploadsDir, 'listings');

  async ensureDirectories(): Promise<void> {
    try {
      await fs.access(this.avatarsDir);
    } catch {
      await fs.mkdir(this.avatarsDir, { recursive: true });
    }
    
    try {
      await fs.access(this.listingsDir);
    } catch {
      await fs.mkdir(this.listingsDir, { recursive: true });
    }
  }

  generateUniqueFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename);
    const hash = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `${timestamp}-${hash}${ext}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      await fs.rename(sourcePath, destinationPath);
    } catch (error) {
      // If rename fails (different filesystems), copy and delete
      await fs.copyFile(sourcePath, destinationPath);
      await fs.unlink(sourcePath);
    }
  }

  getPublicUrl(filename: string, type: 'avatar' | 'listing' = 'avatar'): string {
    if (type === 'avatar') {
      return `/uploads/avatars/${filename}`;
    }
    return `/uploads/listings/${filename}`;
  }

  async validateImageFile(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);
      
      // Check file size (max 5MB for avatars)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (stats.size > maxSize) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  isValidImageExtension(filename: string): boolean {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(filename).toLowerCase();
    return validExtensions.includes(ext);
  }

  getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

export const uploadService = new UploadService();