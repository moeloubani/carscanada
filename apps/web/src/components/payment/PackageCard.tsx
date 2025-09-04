'use client';

import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FeaturedPackage } from '@/hooks/usePackages';

interface PackageCardProps {
  package: FeaturedPackage;
  onSelect: (packageId: string) => void;
  isSelected?: boolean;
  disabled?: boolean;
}

export function PackageCard({ 
  package: pkg, 
  onSelect, 
  isSelected = false,
  disabled = false 
}: PackageCardProps) {
  return (
    <Card 
      className={cn(
        'relative transition-all duration-200 hover:shadow-lg',
        isSelected && 'ring-2 ring-blue-600 shadow-lg',
        pkg.popular && 'border-blue-600'
      )}
    >
      {pkg.popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600">
          Most Popular
        </Badge>
      )}
      
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {pkg.name}
          {pkg.popular && <Sparkles className="h-5 w-5 text-blue-600" />}
        </CardTitle>
        <CardDescription>{pkg.duration} days featured</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">${pkg.price}</span>
            <span className="text-sm text-muted-foreground">CAD</span>
          </div>
          {pkg.originalPrice && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground line-through">
                ${pkg.originalPrice}
              </span>
              <Badge variant="secondary" className="text-xs">
                Save ${(pkg.originalPrice - pkg.price).toFixed(2)}
              </Badge>
            </div>
          )}
        </div>

        <ul className="space-y-2">
          {pkg.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isSelected ? 'default' : 'outline'}
          onClick={() => onSelect(pkg.id)}
          disabled={disabled}
        >
          {isSelected ? 'Selected' : 'Select Package'}
        </Button>
      </CardFooter>
    </Card>
  );
}