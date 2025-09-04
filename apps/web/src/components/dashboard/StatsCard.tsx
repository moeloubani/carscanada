import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number | null;
  description?: string;
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description,
  className 
}: StatsCardProps) {
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
  const trendPositive = trend && trend > 0;
  const trendNegative = trend && trend < 0;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {(trend !== null && trend !== undefined) && (
          <div className={cn(
            "flex items-center text-xs mt-1",
            trendPositive && "text-green-600",
            trendNegative && "text-red-600",
            !trendPositive && !trendNegative && "text-muted-foreground"
          )}>
            {trendPositive && <TrendingUp className="h-3 w-3 mr-1" />}
            {trendNegative && <TrendingDown className="h-3 w-3 mr-1" />}
            <span>{Math.abs(trend)}% from last month</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}