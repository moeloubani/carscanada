import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Price formatting functions
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPriceRange(minPrice?: number, maxPrice?: number): string {
  if (!minPrice && !maxPrice) return 'Any Price';
  if (!minPrice) return `Under ${formatPrice(maxPrice!)}`;
  if (!maxPrice) return `Over ${formatPrice(minPrice)}`;
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
}

// Mileage formatting
export function formatMileage(mileage: number): string {
  return new Intl.NumberFormat('en-CA').format(mileage) + ' km';
}

export function formatMileageShort(mileage: number): string {
  if (mileage < 1000) return `${mileage} km`;
  if (mileage < 1000000) {
    return `${Math.round(mileage / 1000)}k km`;
  }
  return `${(mileage / 1000000).toFixed(1)}M km`;
}

// Date formatting
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

// Canadian province helpers
export const PROVINCES = {
  AB: 'Alberta',
  BC: 'British Columbia',
  MB: 'Manitoba',
  NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador',
  NS: 'Nova Scotia',
  NT: 'Northwest Territories',
  NU: 'Nunavut',
  ON: 'Ontario',
  PE: 'Prince Edward Island',
  QC: 'Quebec',
  SK: 'Saskatchewan',
  YT: 'Yukon',
} as const;

export type ProvinceCode = keyof typeof PROVINCES;

export function getProvinceName(code: ProvinceCode): string {
  return PROVINCES[code] || code;
}

export function getProvinceCode(name: string): ProvinceCode | undefined {
  const entry = Object.entries(PROVINCES).find(
    ([_, provinceName]) => provinceName.toLowerCase() === name.toLowerCase()
  );
  return entry ? (entry[0] as ProvinceCode) : undefined;
}

// Image URL helpers
export function getImageUrl(path?: string | null): string {
  if (!path) return '/images/no-image.png';
  
  // If it's already a full URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Otherwise, prepend the API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
  return `${apiUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getCarImageUrl(images?: string[] | null, index = 0): string {
  if (!images || images.length === 0) {
    return '/images/default-car.png';
  }
  return getImageUrl(images[index]);
}

// Form validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  // Canadian phone number format
  const phoneRegex = /^(\+?1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
  return phoneRegex.test(phone);
}

export function validatePostalCode(postalCode: string): boolean {
  // Canadian postal code format
  const postalCodeRegex = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/;
  return postalCodeRegex.test(postalCode);
}

export function formatPhone(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Format as +1 (XXX) XXX-XXXX
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
}

export function formatPostalCode(postalCode: string): string {
  const cleaned = postalCode.replace(/\s/g, '').toUpperCase();
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }
  return postalCode.toUpperCase();
}

// Utility functions for listings
export function getListingStatus(status: string): {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  switch (status.toLowerCase()) {
    case 'active':
      return { label: 'Active', variant: 'default' };
    case 'pending':
      return { label: 'Pending', variant: 'secondary' };
    case 'sold':
      return { label: 'Sold', variant: 'destructive' };
    case 'draft':
      return { label: 'Draft', variant: 'outline' };
    default:
      return { label: status, variant: 'default' };
  }
}

export function getListingAge(createdAt: string | Date): string {
  const date = typeof createdAt === 'string' ? parseISO(createdAt) : createdAt;
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

// Search and filter helpers
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
}

export function parseQueryString<T = Record<string, any>>(
  queryString: string
): T {
  const searchParams = new URLSearchParams(queryString);
  const result: any = {};
  
  searchParams.forEach((value, key) => {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  });
  
  return result as T;
}

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Generate initials from name
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Calculate distance between two coordinates (in km)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}