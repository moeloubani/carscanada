import { z } from 'zod';

// Create checkout session schema
export const createCheckoutSchema = z.object({
  packageId: z.string().uuid('Invalid package ID'),
  listingId: z.string().uuid('Invalid listing ID'),
  successUrl: z.string().url('Invalid success URL').optional(),
  cancelUrl: z.string().url('Invalid cancel URL').optional(),
});

// Get packages query schema
export const getPackagesSchema = z.object({
  isActive: z
    .string()
    .transform(val => val === 'true')
    .optional(),
});

// Transaction query schema  
export const transactionQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
});

// Webhook event schema
export const webhookEventSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
});

// Package creation schema (for admin)
export const createPackageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  durationDays: z.number().int().positive('Duration must be a positive integer'),
  features: z.array(z.string()).min(1, 'At least one feature is required'),
  isActive: z.boolean().default(true),
});

// Update package schema (for admin)
export const updatePackageSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  durationDays: z.number().int().positive().optional(),
  features: z.array(z.string()).min(1).optional(),
  isActive: z.boolean().optional(),
});

export type CreateCheckoutDto = z.infer<typeof createCheckoutSchema>;
export type GetPackagesDto = z.infer<typeof getPackagesSchema>;
export type TransactionQueryDto = z.infer<typeof transactionQuerySchema>;
export type WebhookEventDto = z.infer<typeof webhookEventSchema>;
export type CreatePackageDto = z.infer<typeof createPackageSchema>;
export type UpdatePackageDto = z.infer<typeof updatePackageSchema>;