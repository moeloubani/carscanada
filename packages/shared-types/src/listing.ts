export enum ListingStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  EXPIRED = 'EXPIRED',
  DELETED = 'DELETED',
}

export interface Listing {
  id: string;
  userId: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileageKm: number;
  vin?: string;
  bodyType: string;
  transmission: string;
  fuelType: string;
  drivetrain: string;
  exteriorColor: string;
  interiorColor?: string;
  engine?: string;
  description: string;
  condition: string;
  province: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  status: ListingStatus;
  isFeatured: boolean;
  featuredUntil?: Date;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  images: ListingImage[];
  user?: User;
}

export interface ListingImage {
  id: string;
  listingId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  position: number;
  isPrimary: boolean;
  createdAt: Date;
}

export interface CreateListingDto {
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileageKm: number;
  vin?: string;
  bodyType: string;
  transmission: string;
  fuelType: string;
  drivetrain: string;
  exteriorColor: string;
  interiorColor?: string;
  engine?: string;
  description: string;
  condition: string;
  province: string;
  city: string;
  postalCode: string;
}

export interface ListingFilters {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  bodyType?: string;
  transmission?: string;
  fuelType?: string;
  province?: string;
  city?: string;
  searchQuery?: string;
  status?: ListingStatus;
  userId?: string;
}

import { User } from './user';