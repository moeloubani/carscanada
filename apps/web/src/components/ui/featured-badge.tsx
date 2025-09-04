'use client';

import { Sparkles, Crown, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FeaturedBadgeProps {
  variant?: 'default' | 'premium' | 'compact';
  className?: string;
  expiresAt?: string;
  showExpiry?: boolean;
}

export function FeaturedBadge({ 
  variant = 'default', 
  className,
  expiresAt,
  showExpiry = false
}: FeaturedBadgeProps) {
  const isPremium = variant === 'premium';
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <Badge 
        className={cn(
          "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black border-0",
          className
        )}
      >
        <Sparkles className="h-3 w-3" />
      </Badge>
    );
  }

  const Icon = isPremium ? Crown : Sparkles;
  const bgClass = isPremium 
    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
    : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black border-0";

  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <Badge 
        className={cn(
          "px-2 py-1 flex items-center gap-1 shadow-md",
          bgClass
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="font-semibold text-xs">
          {isPremium ? 'Premium' : 'Featured'}
        </span>
      </Badge>
      {showExpiry && expiresAt && (
        <span className="text-[10px] text-muted-foreground text-center">
          Until {new Date(expiresAt).toLocaleDateString('en-CA', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </span>
      )}
    </div>
  );
}

export function FeaturedHighlight({ 
  children,
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "relative",
      "before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-200/20 before:to-orange-200/20 before:rounded-lg before:-z-10",
      "after:absolute after:inset-0 after:bg-gradient-to-r after:from-yellow-400/10 after:via-transparent after:to-orange-400/10 after:animate-pulse after:rounded-lg after:-z-10",
      className
    )}>
      {children}
    </div>
  );
}