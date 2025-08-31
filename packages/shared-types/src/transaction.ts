export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface Transaction {
  id: string;
  userId: string;
  listingId?: string;
  packageId?: string;
  amount: number;
  currency: string;
  stripePaymentId?: string;
  status: TransactionStatus;
  createdAt: Date;
}

export interface FeaturedPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}