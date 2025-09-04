'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Grid3x3, List, SlidersHorizontal, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ListingCard } from '@/components/listings/ListingCard';
import { ListingFilters } from '@/components/listings/ListingFilters';
import { useListings } from '@/hooks/useListings';
import { SORT_OPTIONS, DEFAULT_PAGE_SIZE } from '@/lib/constants';

function ListingsContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [filters, setFilters] = useState<any>({});

  // Build filters from search params
  useEffect(() => {
    const newFilters: any = {};
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'sort') {
        newFilters[key] = value;
      }
    });
    setFilters(newFilters);
    
    const pageParam = searchParams.get('page');
    if (pageParam) {
      setPage(parseInt(pageParam, 10));
    }
    
    const sortParam = searchParams.get('sort');
    if (sortParam) {
      setSortBy(sortParam);
    }
  }, [searchParams]);

  // Parse sort parameter
  const [sortField, sortOrder] = sortBy.split('_');

  // Fetch listings
  const { data, isLoading, error } = useListings({
    ...filters,
    page,
    limit: DEFAULT_PAGE_SIZE,
    sort: sortField,
    order: sortOrder as 'asc' | 'desc',
  });

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = data?.meta.totalPages || 1;
  const total = data?.meta.total || 0;
  const showingFrom = ((page - 1) * DEFAULT_PAGE_SIZE) + 1;
  const showingTo = Math.min(page * DEFAULT_PAGE_SIZE, total);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Cars</h1>
          <p className="text-gray-600">
            {total > 0 ? `${total.toLocaleString()} vehicles available` : 'Search for your perfect car'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block">
            <ListingFilters onFiltersChange={handleFiltersChange} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="bg-white rounded-lg border p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Mobile Filters */}
                  <div className="lg:hidden">
                    <ListingFilters 
                      onFiltersChange={handleFiltersChange} 
                      variant="mobile"
                    />
                  </div>
                  
                  {/* View Mode Toggle */}
                  <div className="flex rounded-lg border">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      className="rounded-r-none"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      className="rounded-l-none"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Results Count */}
                  {total > 0 && (
                    <span className="text-sm text-gray-600">
                      Showing {showingFrom}-{showingTo} of {total}
                    </span>
                  )}
                </div>

                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {Object.keys(filters).length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value) return null;
                  let displayValue = value;
                  
                  // Format filter display
                  if (key === 'minPrice' || key === 'maxPrice') {
                    displayValue = `$${parseInt(value as string).toLocaleString()}`;
                  }
                  
                  return (
                    <Badge key={key} variant="secondary" className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}: {displayValue}
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Listings Grid/List */}
            {isLoading ? (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"
              }>
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-8 w-1/2 mb-3" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="p-8 text-center">
                <p className="text-red-600 mb-4">Error loading listings</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </Card>
            ) : data?.data && data.data.length > 0 ? (
              <>
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-4"
                }>
                  {data.data.map(listing => (
                    <ListingCard 
                      key={listing.id} 
                      listing={listing} 
                      variant={viewMode === 'list' ? 'horizontal' : 'default'}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      
                      <div className="flex gap-1">
                        {/* Show first page */}
                        {page > 3 && (
                          <>
                            <Button
                              variant={page === 1 ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(1)}
                            >
                              1
                            </Button>
                            {page > 4 && <span className="px-2">...</span>}
                          </>
                        )}
                        
                        {/* Show pages around current page */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
                          if (pageNum > 0 && pageNum <= totalPages) {
                            return (
                              <Button
                                key={pageNum}
                                variant={page === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                          return null;
                        }).filter(Boolean)}
                        
                        {/* Show last page */}
                        {page < totalPages - 2 && (
                          <>
                            {page < totalPages - 3 && <span className="px-2">...</span>}
                            <Button
                              variant={page === totalPages ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(totalPages)}
                            >
                              {totalPages}
                            </Button>
                          </>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-semibold mb-2">No listings found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search criteria to see more results
                  </p>
                  <Button onClick={() => {
                    setFilters({});
                    setPage(1);
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto max-w-7xl">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-3">
              <Skeleton className="h-20 w-full mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ListingsContent />
    </Suspense>
  );
}