import { Eye, MessageSquare, Heart, HelpCircle, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'view' | 'message' | 'favorite' | 'inquiry';
  title: string;
  description: string;
  timestamp: string;
  listing?: {
    id: string;
    title: string;
    price: number;
  };
  user?: {
    name: string;
    avatar?: string;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
  className?: string;
}

const activityIcons = {
  view: Eye,
  message: MessageSquare,
  favorite: Heart,
  inquiry: HelpCircle,
};

const activityColors = {
  view: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  message: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  favorite: 'text-red-500 bg-red-50 dark:bg-red-900/20',
  inquiry: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
};

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No recent activity</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {activities.map((activity) => {
        const Icon = activityIcons[activity.type];
        const colorClass = activityColors[activity.type];

        return (
          <div key={activity.id} className="flex gap-4">
            {/* Icon or Avatar */}
            <div className="flex-shrink-0">
              {activity.user ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.user.avatar} />
                  <AvatarFallback>
                    {activity.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", colorClass)}>
                  <Icon className="h-4 w-4" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {activity.title}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {activity.description}
              </p>
              {activity.listing && (
                <div className="mt-2 p-2 bg-muted/50 rounded-md">
                  <p className="text-xs font-medium">{activity.listing.title}</p>
                  <p className="text-xs text-muted-foreground">
                    ${activity.listing.price.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Timestamp */}
            <div className="flex-shrink-0">
              <p className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {activity.timestamp}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}