'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  CAR_MAKES, 
  CAR_MODELS, 
  BODY_TYPES, 
  FUEL_TYPES, 
  TRANSMISSION_TYPES,
  DRIVETRAIN_TYPES,
  COLORS,
  CONDITIONS,
  PROVINCES,
  MAJOR_CITIES,
  PRICE_RANGES,
  MILEAGE_RANGES,
  YEAR_RANGES
} from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ListingFiltersProps {
  onFiltersChange?: (filters: any) => void;
  className?: string;
  variant?: 'sidebar' | 'mobile';
}

export function ListingFilters({ 
  onFiltersChange, 
  className,
  variant = 'sidebar' 
}: ListingFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<any>({
    make: searchParams.get('make') || '',
    model: searchParams.get('model') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minYear: searchParams.get('minYear') || '',
    maxYear: searchParams.get('maxYear') || '',
    minMileage: searchParams.get('minMileage') || '',
    maxMileage: searchParams.get('maxMileage') || '',
    bodyType: searchParams.get('bodyType') || '',
    fuelType: searchParams.get('fuelType') || '',
    transmission: searchParams.get('transmission') || '',
    drivetrain: searchParams.get('drivetrain') || '',
    color: searchParams.get('color') || '',
    condition: searchParams.get('condition') || '',
    province: searchParams.get('province') || '',
    city: searchParams.get('city') || '',
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    price: true,
    specs: true,
    location: false,
  });

  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    if (filters.make && CAR_MODELS[filters.make]) {
      setAvailableModels(CAR_MODELS[filters.make]);
    } else {
      setAvailableModels([]);
      if (filters.model) {
        handleFilterChange('model', '');
      }
    }
  }, [filters.make]);

  useEffect(() => {
    if (filters.province && MAJOR_CITIES[filters.province as keyof typeof MAJOR_CITIES]) {
      setAvailableCities(MAJOR_CITIES[filters.province as keyof typeof MAJOR_CITIES]);
    } else {
      setAvailableCities([]);
      if (filters.city) {
        handleFilterChange('city', '');
      }
    }
  }, [filters.province]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
    onFiltersChange?.(newFilters);
  };

  const updateURL = (newFilters: any) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value as string);
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {} as any);
    setFilters(clearedFilters);
    router.push('/listings', { scroll: false });
    onFiltersChange?.(clearedFilters);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const activeFiltersCount = Object.values(filters).filter(v => v).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Basic Filters */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection('basic')}
          className="flex items-center justify-between w-full text-left font-semibold"
        >
          <span>Make & Model</span>
          {expandedSections.basic ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {expandedSections.basic && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="make">Make</Label>
              <Select value={filters.make} onValueChange={(value) => handleFilterChange('make', value)}>
                <SelectTrigger id="make">
                  <SelectValue placeholder="Select make" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Makes</SelectItem>
                  {CAR_MAKES.map(make => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {availableModels.length > 0 && (
              <div>
                <Label htmlFor="model">Model</Label>
                <Select value={filters.model} onValueChange={(value) => handleFilterChange('model', value)}>
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Models</SelectItem>
                    {availableModels.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select value={filters.condition} onValueChange={(value) => handleFilterChange('condition', value)}>
                <SelectTrigger id="condition">
                  <SelectValue placeholder="Any condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Condition</SelectItem>
                  {CONDITIONS.map(condition => (
                    <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left font-semibold"
        >
          <span>Price & Year</span>
          {expandedSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {expandedSections.price && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="minPrice">Min Price</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="maxPrice">Max Price</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quick Select</Label>
              <div className="grid grid-cols-2 gap-2">
                {PRICE_RANGES.slice(0, 6).map(range => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      handleFilterChange('minPrice', range.min.toString());
                      handleFilterChange('maxPrice', range.max?.toString() || '');
                    }}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="minYear">Min Year</Label>
                <Select value={filters.minYear} onValueChange={(value) => handleFilterChange('minYear', value)}>
                  <SelectTrigger id="minYear">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {YEAR_RANGES.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maxYear">Max Year</Label>
                <Select value={filters.maxYear} onValueChange={(value) => handleFilterChange('maxYear', value)}>
                  <SelectTrigger id="maxYear">
                    <SelectValue placeholder="Max" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {YEAR_RANGES.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Specs */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection('specs')}
          className="flex items-center justify-between w-full text-left font-semibold"
        >
          <span>Vehicle Specs</span>
          {expandedSections.specs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {expandedSections.specs && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bodyType">Body Type</Label>
              <Select value={filters.bodyType} onValueChange={(value) => handleFilterChange('bodyType', value)}>
                <SelectTrigger id="bodyType">
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Type</SelectItem>
                  {BODY_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fuelType">Fuel Type</Label>
              <Select value={filters.fuelType} onValueChange={(value) => handleFilterChange('fuelType', value)}>
                <SelectTrigger id="fuelType">
                  <SelectValue placeholder="Any fuel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Fuel</SelectItem>
                  {FUEL_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transmission">Transmission</Label>
              <Select value={filters.transmission} onValueChange={(value) => handleFilterChange('transmission', value)}>
                <SelectTrigger id="transmission">
                  <SelectValue placeholder="Any transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Transmission</SelectItem>
                  {TRANSMISSION_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="drivetrain">Drivetrain</Label>
              <Select value={filters.drivetrain} onValueChange={(value) => handleFilterChange('drivetrain', value)}>
                <SelectTrigger id="drivetrain">
                  <SelectValue placeholder="Any drivetrain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Drivetrain</SelectItem>
                  {DRIVETRAIN_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="minMileage">Min Mileage</Label>
                <Input
                  id="minMileage"
                  type="number"
                  placeholder="Min km"
                  value={filters.minMileage}
                  onChange={(e) => handleFilterChange('minMileage', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="maxMileage">Max Mileage</Label>
                <Input
                  id="maxMileage"
                  type="number"
                  placeholder="Max km"
                  value={filters.maxMileage}
                  onChange={(e) => handleFilterChange('maxMileage', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <Select value={filters.color} onValueChange={(value) => handleFilterChange('color', value)}>
                <SelectTrigger id="color">
                  <SelectValue placeholder="Any color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Color</SelectItem>
                  {COLORS.map(color => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Location */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection('location')}
          className="flex items-center justify-between w-full text-left font-semibold"
        >
          <span>Location</span>
          {expandedSections.location ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {expandedSections.location && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="province">Province</Label>
              <Select value={filters.province} onValueChange={(value) => handleFilterChange('province', value)}>
                <SelectTrigger id="province">
                  <SelectValue placeholder="All provinces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Provinces</SelectItem>
                  {PROVINCES.map(province => (
                    <SelectItem key={province.code} value={province.code}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {availableCities.length > 0 && (
              <div>
                <Label htmlFor="city">City</Label>
                <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
                  <SelectTrigger id="city">
                    <SelectValue placeholder="All cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cities</SelectItem>
                    {availableCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          onClick={clearFilters}
          variant="outline"
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  if (variant === 'mobile') {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="md:hidden">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2" variant="secondary">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className={cn("bg-white rounded-lg border p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary">
            {activeFiltersCount} active
          </Badge>
        )}
      </div>
      <FilterContent />
    </div>
  );
}