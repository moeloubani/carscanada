import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const calculateTax = (amount: number, taxRate = 0.13): number => {
  return amount * taxRate;
};

export const calculateTotal = (amount: number, taxRate = 0.13): number => {
  return amount + calculateTax(amount, taxRate);
};