import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
  .optional();

export const postalCodeSchema = z
  .string()
  .regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, 'Invalid Canadian postal code');

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: phoneSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const createListingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().positive('Price must be positive'),
  mileageKm: z.number().int().min(0, 'Mileage cannot be negative'),
  vin: z.string().length(17).optional(),
  bodyType: z.string().min(1, 'Body type is required'),
  transmission: z.string().min(1, 'Transmission is required'),
  fuelType: z.string().min(1, 'Fuel type is required'),
  drivetrain: z.string().min(1, 'Drivetrain is required'),
  exteriorColor: z.string().min(1, 'Exterior color is required'),
  interiorColor: z.string().optional(),
  engine: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  condition: z.string().min(1, 'Condition is required'),
  province: z.string().min(1, 'Province is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: postalCodeSchema,
});

export const updateListingSchema = createListingSchema.partial();

export const listingFiltersSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  yearMin: z.number().int().optional(),
  yearMax: z.number().int().optional(),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  mileageMax: z.number().int().positive().optional(),
  bodyType: z.string().optional(),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  searchQuery: z.string().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(1000),
});

export const startConversationSchema = z.object({
  listingId: z.string().uuid(),
  message: z.string().min(1, 'Message cannot be empty').max(1000),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListingFiltersInput = z.infer<typeof listingFiltersSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type StartConversationInput = z.infer<typeof startConversationSchema>;