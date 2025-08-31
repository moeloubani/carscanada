export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchAlert {
  id: string;
  userId: string;
  name: string;
  filters: any;
  frequency: 'INSTANT' | 'DAILY' | 'WEEKLY';
  isActive: boolean;
  lastSentAt?: Date;
  createdAt: Date;
}

export const CANADIAN_PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
] as const;

export const CAR_BODY_TYPES = [
  'Sedan',
  'SUV',
  'Truck',
  'Coupe',
  'Hatchback',
  'Convertible',
  'Van',
  'Wagon',
  'Minivan',
] as const;

export const TRANSMISSION_TYPES = [
  'Automatic',
  'Manual',
  'CVT',
] as const;

export const FUEL_TYPES = [
  'Gasoline',
  'Diesel',
  'Hybrid',
  'Electric',
  'Plug-in Hybrid',
] as const;

export const DRIVETRAIN_TYPES = [
  'FWD',
  'RWD',
  'AWD',
  '4WD',
] as const;

export const CAR_CONDITIONS = [
  'New',
  'Like New',
  'Excellent',
  'Good',
  'Fair',
  'Poor',
] as const;