import prisma from '../config/database';
import { getRedis } from '../config/redis';
import { Listing, Conversation } from '@prisma/client';

interface ListingAnalytics {
  listingId: string;
  views: {
    total: number;
    daily: { date: string; count: number }[];
    weekly: { week: string; count: number }[];
    monthly: { month: string; count: number }[];
  };
  messages: {
    total: number;
    daily: { date: string; count: number }[];
  };
  engagement: {
    saveCount: number;
    conversionRate: number;
  };
}

interface DashboardAnalytics {
  overview: {
    totalListings: number;
    activeListings: number;
    soldListings: number;
    totalViews: number;
    totalMessages: number;
    totalSaves: number;
  };
  performance: {
    viewsTrend: { date: string; count: number }[];
    messagesTrend: { date: string; count: number }[];
    topListings: {
      id: string;
      title: string;
      views: number;
      messages: number;
    }[];
  };
  revenue: {
    total: number;
    featured: number;
    trend: { date: string; amount: number }[];
  };
}

interface MarketTrends {
  popularMakes: {
    make: string;
    count: number;
    averagePrice: number;
  }[];
  popularModels: {
    make: string;
    model: string;
    count: number;
    averagePrice: number;
  }[];
  priceRanges: {
    range: string;
    count: number;
    percentage: number;
  }[];
  averageMetrics: {
    price: number;
    mileage: number;
    age: number;
  };
  provincialData: {
    province: string;
    listingCount: number;
    averagePrice: number;
  }[];
}

interface AnalyticsEvent {
  type: 'view' | 'message' | 'save' | 'click' | 'search' | 'filter';
  entityType: 'listing' | 'user' | 'search';
  entityId: string;
  userId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export class AnalyticsService {
  /**
   * Track a listing view
   */
  async trackListingView(listingId: string, userId?: string): Promise<void> {
    const redis = getRedis();
    const today = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours();

    // Increment view count in database
    await prisma.listing.update({
      where: { id: listingId },
      data: { viewsCount: { increment: 1 } },
    });

    if (redis) {
      try {
        // Track in Redis for real-time analytics
        const keys = [
          `listing:${listingId}:views:${today}`,
          `listing:${listingId}:views:total`,
          `global:views:${today}`,
          `global:views:hourly:${today}:${hour}`,
        ];

        for (const key of keys) {
          await redis.incr(key);
        }

        // Set expiry for daily keys (7 days)
        await redis.expire(`listing:${listingId}:views:${today}`, 7 * 24 * 60 * 60);
        await redis.expire(`global:views:${today}`, 7 * 24 * 60 * 60);
        await redis.expire(`global:views:hourly:${today}:${hour}`, 48 * 60 * 60);

        // Track unique viewers
        if (userId) {
          await redis.sadd(`listing:${listingId}:viewers:${today}`, userId);
          await redis.expire(`listing:${listingId}:viewers:${today}`, 7 * 24 * 60 * 60);
        }
      } catch (error) {
        console.error('Redis error tracking listing view:', error);
      }
    }
  }

  /**
   * Get listing analytics
   */
  async getListingAnalytics(
    listingId: string,
    userId: string,
    days: number = 30
  ): Promise<ListingAnalytics> {
    // Verify ownership
    const listing = await prisma.listing.findFirst({
      where: { id: listingId, userId },
      include: {
        savedBy: true,
        conversations: {
          include: {
            messages: true,
          },
        },
      },
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    const redis = getRedis();
    const now = new Date();
    const dailyViews: { date: string; count: number }[] = [];
    const dailyMessages: { date: string; count: number }[] = [];

    // Get daily views from Redis if available
    if (redis) {
      for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        try {
          const views = await redis.get(`listing:${listingId}:views:${dateStr}`);
          dailyViews.push({
            date: dateStr,
            count: views ? parseInt(views) : 0,
          });
        } catch (error) {
          console.error('Redis error getting daily views:', error);
        }
      }
    }

    // Calculate weekly and monthly aggregates
    const weeklyViews = this.aggregateToWeekly(dailyViews);
    const monthlyViews = this.aggregateToMonthly(dailyViews);

    // Get message counts by date
    const messagesByDate = listing.conversations.reduce((acc, conv) => {
      conv.messages.forEach(msg => {
        const date = msg.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      dailyMessages.push({
        date: dateStr,
        count: messagesByDate[dateStr] || 0,
      });
    }

    // Calculate engagement metrics
    const totalMessages = listing.conversations.reduce(
      (sum, conv) => sum + conv.messages.length,
      0
    );

    const conversionRate = listing.viewsCount > 0
      ? (totalMessages / listing.viewsCount) * 100
      : 0;

    return {
      listingId,
      views: {
        total: listing.viewsCount,
        daily: dailyViews.reverse(),
        weekly: weeklyViews,
        monthly: monthlyViews,
      },
      messages: {
        total: totalMessages,
        daily: dailyMessages.reverse(),
      },
      engagement: {
        saveCount: listing.savedBy.length,
        conversionRate: Math.round(conversionRate * 100) / 100,
      },
    };
  }

  /**
   * Get user dashboard analytics
   */
  async getUserDashboard(userId: string): Promise<DashboardAnalytics> {
    const [listings, conversations, transactions] = await Promise.all([
      prisma.listing.findMany({
        where: { userId },
        include: {
          savedBy: true,
          conversations: {
            include: {
              messages: true,
            },
          },
        },
      }),
      prisma.conversation.findMany({
        where: { sellerId: userId },
        include: {
          messages: true,
        },
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          status: 'COMPLETED',
        },
      }),
    ]);

    // Calculate overview metrics
    const totalViews = listings.reduce((sum, l) => sum + l.viewsCount, 0);
    const totalMessages = conversations.reduce(
      (sum, c) => sum + c.messages.length,
      0
    );
    const totalSaves = listings.reduce((sum, l) => sum + l.savedBy.length, 0);
    const totalRevenue = transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );

    // Get top performing listings
    const topListings = listings
      .map(l => ({
        id: l.id,
        title: l.title,
        views: l.viewsCount,
        messages: l.conversations.reduce(
          (sum, c) => sum + c.messages.length,
          0
        ),
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Calculate trends (last 30 days)
    const now = new Date();
    const viewsTrend: { date: string; count: number }[] = [];
    const messagesTrend: { date: string; count: number }[] = [];
    const revenueTrend: { date: string; amount: number }[] = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // This would ideally come from Redis or a dedicated analytics table
      viewsTrend.push({ date: dateStr, count: 0 });
      messagesTrend.push({ date: dateStr, count: 0 });
      revenueTrend.push({ date: dateStr, amount: 0 });
    }

    // Fill in actual data for messages
    conversations.forEach(conv => {
      conv.messages.forEach(msg => {
        const dateStr = msg.createdAt.toISOString().split('T')[0];
        const trend = messagesTrend.find(t => t.date === dateStr);
        if (trend) trend.count++;
      });
    });

    // Fill in revenue data
    transactions.forEach(trans => {
      const dateStr = trans.createdAt.toISOString().split('T')[0];
      const trend = revenueTrend.find(t => t.date === dateStr);
      if (trend) trend.amount += Number(trans.amount);
    });

    return {
      overview: {
        totalListings: listings.length,
        activeListings: listings.filter(l => l.status === 'ACTIVE').length,
        soldListings: listings.filter(l => l.status === 'SOLD').length,
        totalViews,
        totalMessages,
        totalSaves,
      },
      performance: {
        viewsTrend,
        messagesTrend,
        topListings,
      },
      revenue: {
        total: totalRevenue,
        featured: transactions
          .filter(t => t.packageId !== null)
          .reduce((sum, t) => sum + Number(t.amount), 0),
        trend: revenueTrend,
      },
    };
  }

  /**
   * Get market trends
   */
  async getMarketTrends(
    province?: string,
    days: number = 30
  ): Promise<MarketTrends> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const where = {
      status: 'ACTIVE' as const,
      createdAt: { gte: dateThreshold },
      ...(province && { province }),
    };

    // Get all active listings for analysis
    const listings = await prisma.listing.findMany({
      where,
      select: {
        make: true,
        model: true,
        year: true,
        price: true,
        mileageKm: true,
        province: true,
      },
    });

    // Calculate popular makes
    const makeStats = new Map<string, { count: number; totalPrice: number }>();
    listings.forEach(l => {
      const stats = makeStats.get(l.make) || { count: 0, totalPrice: 0 };
      stats.count++;
      stats.totalPrice += Number(l.price);
      makeStats.set(l.make, stats);
    });

    const popularMakes = Array.from(makeStats.entries())
      .map(([make, stats]) => ({
        make,
        count: stats.count,
        averagePrice: Math.round(stats.totalPrice / stats.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate popular models
    const modelStats = new Map<string, { count: number; totalPrice: number }>();
    listings.forEach(l => {
      const key = `${l.make}|${l.model}`;
      const stats = modelStats.get(key) || { count: 0, totalPrice: 0 };
      stats.count++;
      stats.totalPrice += Number(l.price);
      modelStats.set(key, stats);
    });

    const popularModels = Array.from(modelStats.entries())
      .map(([key, stats]) => {
        const [make, model] = key.split('|');
        return {
          make,
          model,
          count: stats.count,
          averagePrice: Math.round(stats.totalPrice / stats.count),
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate price ranges
    const priceRanges = [
      { min: 0, max: 10000, range: 'Under $10,000' },
      { min: 10000, max: 25000, range: '$10,000 - $25,000' },
      { min: 25000, max: 50000, range: '$25,000 - $50,000' },
      { min: 50000, max: 100000, range: '$50,000 - $100,000' },
      { min: 100000, max: Infinity, range: 'Over $100,000' },
    ].map(({ min, max, range }) => {
      const count = listings.filter(
        l => Number(l.price) >= min && Number(l.price) < max
      ).length;
      return {
        range,
        count,
        percentage: Math.round((count / listings.length) * 100),
      };
    });

    // Calculate average metrics
    const totalPrice = listings.reduce((sum, l) => sum + Number(l.price), 0);
    const totalMileage = listings.reduce((sum, l) => sum + l.mileageKm, 0);
    const currentYear = new Date().getFullYear();
    const totalAge = listings.reduce((sum, l) => sum + (currentYear - l.year), 0);

    // Provincial data
    const provinceStats = new Map<string, { count: number; totalPrice: number }>();
    listings.forEach(l => {
      const stats = provinceStats.get(l.province) || { count: 0, totalPrice: 0 };
      stats.count++;
      stats.totalPrice += Number(l.price);
      provinceStats.set(l.province, stats);
    });

    const provincialData = Array.from(provinceStats.entries())
      .map(([province, stats]) => ({
        province,
        listingCount: stats.count,
        averagePrice: Math.round(stats.totalPrice / stats.count),
      }))
      .sort((a, b) => b.listingCount - a.listingCount);

    return {
      popularMakes,
      popularModels,
      priceRanges,
      averageMetrics: {
        price: Math.round(totalPrice / listings.length),
        mileage: Math.round(totalMileage / listings.length),
        age: Math.round(totalAge / listings.length),
      },
      provincialData,
    };
  }

  /**
   * Track a user event
   */
  async trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    const redis = getRedis();
    
    if (!redis) return;

    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date(),
    };

    try {
      // Store event in Redis for processing
      const key = `events:${event.type}:${new Date().toISOString().split('T')[0]}`;
      await redis.lpush(key, JSON.stringify(fullEvent));
      
      // Keep events for 7 days
      await redis.expire(key, 7 * 24 * 60 * 60);
      
      // Also track in a stream for real-time processing
      await redis.xadd(
        'analytics:stream',
        '*',
        'type', event.type,
        'entityType', event.entityType,
        'entityId', event.entityId,
        'userId', event.userId || '',
        'metadata', JSON.stringify(event.metadata || {}),
        'timestamp', fullEvent.timestamp.toISOString()
      );
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  /**
   * Aggregate daily analytics
   */
  async aggregateDailyAnalytics(): Promise<void> {
    const redis = getRedis();
    if (!redis) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    try {
      // Get all listing IDs
      const listings = await prisma.listing.findMany({
        select: { id: true },
      });

      for (const listing of listings) {
        const viewsKey = `listing:${listing.id}:views:${dateStr}`;
        const views = await redis.get(viewsKey);
        
        if (views && parseInt(views) > 0) {
          // Store in a more permanent location or database
          // For now, we'll keep in Redis with longer TTL
          const monthlyKey = `listing:${listing.id}:views:monthly:${dateStr.slice(0, 7)}`;
          await redis.incrby(monthlyKey, parseInt(views));
          await redis.expire(monthlyKey, 365 * 24 * 60 * 60); // Keep for 1 year
        }
      }

      console.log(`Aggregated analytics for ${dateStr}`);
    } catch (error) {
      console.error('Error aggregating daily analytics:', error);
    }
  }

  /**
   * Clean up old analytics data
   */
  async cleanupOldAnalytics(daysToKeep: number = 90): Promise<void> {
    const redis = getRedis();
    if (!redis) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      // Clean up old event streams
      const streamInfo = await redis.xinfo('STREAM', 'analytics:stream').catch(() => null);
      if (streamInfo) {
        const cutoffTimestamp = cutoffDate.getTime();
        await redis.xtrim('analytics:stream', 'MINID', `${cutoffTimestamp}-0`);
      }

      console.log(`Cleaned up analytics data older than ${daysToKeep} days`);
    } catch (error) {
      console.error('Error cleaning up analytics:', error);
    }
  }

  /**
   * Helper: Aggregate daily data to weekly
   */
  private aggregateToWeekly(
    dailyData: { date: string; count: number }[]
  ): { week: string; count: number }[] {
    const weekly = new Map<string, number>();

    dailyData.forEach(({ date, count }) => {
      const d = new Date(date);
      const week = this.getWeekString(d);
      weekly.set(week, (weekly.get(week) || 0) + count);
    });

    return Array.from(weekly.entries())
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }

  /**
   * Helper: Aggregate daily data to monthly
   */
  private aggregateToMonthly(
    dailyData: { date: string; count: number }[]
  ): { month: string; count: number }[] {
    const monthly = new Map<string, number>();

    dailyData.forEach(({ date, count }) => {
      const month = date.slice(0, 7); // YYYY-MM
      monthly.set(month, (monthly.get(month) || 0) + count);
    });

    return Array.from(monthly.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Helper: Get week string for a date
   */
  private getWeekString(date: Date): string {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return startOfWeek.toISOString().split('T')[0];
  }
}