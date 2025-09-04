import prisma from '../config/database';
import { getRedis } from '../config/redis';
import { RegisterInput, LoginInput } from '@carscanada/validators';
import { 
  hashPassword, 
  verifyPassword, 
  generateTokenPair, 
  verifyRefreshToken,
  generateResetToken,
  hashResetToken
} from '../utils/auth';
import { User } from '@prisma/client';

interface AuthResponse {
  user: Partial<User>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(data: RegisterInput): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true,
        isDealer: true,
        dealerName: true,
        province: true,
        city: true,
        avatarUrl: true,
        createdAt: true,
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    // TODO: Send welcome email with verification link

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await verifyPassword(data.password, user.passwordHash);
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    // Return user without sensitive data
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Check if token is blacklisted
      const redis = getRedis();
      if (redis) {
        const isBlacklisted = await redis.get(`blacklist:${refreshToken}`);
        if (isBlacklisted) {
          throw new Error('Token has been revoked');
        }
      }
      
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new token pair
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
      });

      // Optionally blacklist the old refresh token to prevent reuse
      if (redis) {
        await redis.set(`blacklist:${refreshToken}`, '1', 'EX', 7 * 24 * 60 * 60);
      }

      return tokens;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Token refresh failed: ${error.message}`);
      }
      throw new Error('Token refresh failed');
    }
  }

  async requestPasswordReset(email: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return 'If an account exists with this email, a password reset link will be sent';
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedToken = hashResetToken(resetToken);
    
    // Store token in Redis with 1 hour expiry
    const redis = getRedis();
    if (redis) {
      await redis.set(`reset_token:${hashedToken}`, user.id, 'EX', 3600);
    } else {
      console.warn('Redis not available - password reset tokens cannot be stored');
      throw new Error('Password reset service is temporarily unavailable');
    }
    
    // TODO: Send password reset email with resetToken
    // The email should contain a link like: ${FRONTEND_URL}/reset-password?token=${resetToken}
    console.log(`Password reset token generated for user ${user.email}: ${resetToken}`);
    
    return 'If an account exists with this email, a password reset link will be sent';
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = hashResetToken(token);
    
    // Retrieve user ID from Redis
    const redis = getRedis();
    if (!redis) {
      throw new Error('Password reset service is temporarily unavailable');
    }
    
    const userId = await redis.get(`reset_token:${hashedToken}`);
    
    if (!userId) {
      throw new Error('Invalid or expired reset token');
    }

    const passwordHash = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });
    
    // Delete used token
    await redis.del(`reset_token:${hashedToken}`);
  }

  async logout(refreshToken: string): Promise<void> {
    // Add the refresh token to a blacklist in Redis
    // Set it to expire when the token naturally expires
    // This prevents the refresh token from being used again
    
    const redis = getRedis();
    if (redis && refreshToken) {
      // Blacklist the token for 7 days (same as refresh token expiry)
      await redis.set(`blacklist:${refreshToken}`, '1', 'EX', 7 * 24 * 60 * 60);
    }
    
    // Logout is also handled client-side by removing tokens
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true,
        isDealer: true,
        dealerName: true,
        province: true,
        city: true,
        postalCode: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<Partial<User>> {
    // Don't allow updating certain fields
    const { id, email, passwordHash, createdAt, updatedAt, ...updateData } = data as any;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true,
        isDealer: true,
        dealerName: true,
        province: true,
        city: true,
        postalCode: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return user;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isValidPassword = await verifyPassword(oldPassword, user.passwordHash);
    
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });
  }
}

export default new AuthService();