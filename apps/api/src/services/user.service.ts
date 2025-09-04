import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import { User, Listing, SavedListing, ListingStatus, Prisma } from '@prisma/client';

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  province?: string;
  city?: string;
  postalCode?: string;
  avatarUrl?: string;
  isDealer?: boolean;
  dealerName?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

interface ListingFilterOptions extends PaginationOptions {
  status?: string;
}

interface UserWithoutPassword extends Omit<User, 'passwordHash'> {}

class UserService {
  async getUserById(userId: string): Promise<UserWithoutPassword | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        province: true,
        city: true,
        postalCode: true,
        avatarUrl: true,
        emailVerified: true,
        phoneVerified: true,
        isDealer: true,
        dealerName: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return user;
  }

  async updateUser(userId: string, data: UpdateUserData): Promise<UserWithoutPassword> {
    // Validate dealer fields
    if (data.isDealer === true && !data.dealerName) {
      throw new Error('Dealer name is required for dealer accounts');
    }

    // If switching from dealer to non-dealer, clear dealer name
    if (data.isDealer === false) {
      data.dealerName = null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        province: true,
        city: true,
        postalCode: true,
        avatarUrl: true,
        emailVerified: true,
        phoneVerified: true,
        isDealer: true,
        dealerName: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return updatedUser;
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true }
    });

    if (!user) {
      return false;
    }

    return bcrypt.compare(password, user.passwordHash);
  }

  async deleteUser(userId: string): Promise<void> {
    // Delete user and all related data (cascade is handled by Prisma relations)
    await prisma.$transaction(async (tx) => {
      // Delete saved listings first
      await tx.savedListing.deleteMany({
        where: { userId }
      });

      // Delete search alerts
      await tx.searchAlert.deleteMany({
        where: { userId }
      });

      // Delete messages
      await tx.message.deleteMany({
        where: { senderId: userId }
      });

      // Delete conversations where user is buyer or seller
      await tx.conversation.deleteMany({
        where: {
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        }
      });

      // Delete listing images for user's listings
      const listings = await tx.listing.findMany({
        where: { userId },
        select: { id: true }
      });

      for (const listing of listings) {
        await tx.listingImage.deleteMany({
          where: { listingId: listing.id }
        });
      }

      // Delete listings
      await tx.listing.deleteMany({
        where: { userId }
      });

      // Delete transactions
      await tx.transaction.deleteMany({
        where: { userId }
      });

      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });
  }

  async getUserListings(
    userId: string, 
    options: ListingFilterOptions
  ): Promise<{ listings: Listing[]; total: number; page: number; totalPages: number }> {
    const { page, limit, status } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.ListingWhereInput = {
      userId,
      ...(status && { status: status.toUpperCase() as ListingStatus })
    };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
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
      }),
      prisma.listing.count({ where })
    ]);

    return {
      listings,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getSavedListings(
    userId: string,
    options: PaginationOptions
  ): Promise<{ 
    savedListings: Array<SavedListing & { listing: Listing }>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const where = { userId };

    const [savedListings, total] = await Promise.all([
      prisma.savedListing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1
              },
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  isDealer: true,
                  dealerName: true
                }
              }
            }
          }
        }
      }),
      prisma.savedListing.count({ where })
    ]);

    return {
      savedListings,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async saveListing(userId: string, listingId: string): Promise<SavedListing> {
    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    // Check if already saved
    const existingSave = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId
        }
      }
    });

    if (existingSave) {
      throw new Error('Listing already saved');
    }

    // Create saved listing
    const savedListing = await prisma.savedListing.create({
      data: {
        userId,
        listingId
      }
    });

    return savedListing;
  }

  async unsaveListing(userId: string, listingId: string): Promise<void> {
    const result = await prisma.savedListing.deleteMany({
      where: {
        userId,
        listingId
      }
    });

    if (result.count === 0) {
      throw new Error('Saved listing not found');
    }
  }

  async checkIfListingSaved(userId: string, listingId: string): Promise<boolean> {
    const saved = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId
        }
      }
    });

    return !!saved;
  }
}

export const userService = new UserService();