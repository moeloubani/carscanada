'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PriceBreakdownProps {
  packageName: string;
  duration: number;
  price: number;
  tax?: number;
  discount?: number;
}

export function PriceBreakdown({ 
  packageName, 
  duration, 
  price, 
  tax = 0,
  discount = 0
}: PriceBreakdownProps) {
  const subtotal = price;
  const taxAmount = tax || (subtotal * 0.13); // Default 13% HST for Ontario
  const total = subtotal - discount + taxAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{packageName} Package</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Duration</span>
            <span>{duration} days</span>
          </div>
        </div>

        {discount > 0 && (
          <>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Discount</span>
              <span className="text-green-600">-${discount.toFixed(2)}</span>
            </div>
          </>
        )}

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${(subtotal - discount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (HST)</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-semibold text-lg">${total.toFixed(2)} CAD</span>
        </div>
      </CardContent>
    </Card>
  );
}