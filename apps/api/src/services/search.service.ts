import prisma from '../config/database';
import { Prisma, SearchAlert, AlertFrequency, Listing } from '@prisma/client';
import { getSearchAlertsQueue, JOB_NAMES } from '../config/queue';
import { EmailService } from './email.service';
import { getRedis } from '../config/redis';

interface SearchFilters {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  bodyType?: string;
  transmission?: string;
  fuelType?: string;
  drivetrain?: string;
  province?: string;
  city?: string;
  condition?: string;
}

interface SearchAlertData {
  name: string;
  filters: SearchFilters;
  frequency: AlertFrequency;
}

interface PopularSearch {
  term: string;
  count: number;
  type: 'make' | 'model' | 'make_model';
}

export class SearchService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Get auto-complete suggestions for makes and models
   */
  async getSuggestions(query: string, type?: 'make' | 'model', make?: string): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const normalizedQuery = query.toLowerCase();

    if (type === 'model' && make) {
      // Get model suggestions for a specific make
      const models = await prisma.listing.findMany({
        where: {
          make: {
            equals: make,
            mode: 'insensitive',
          },
          model: {
            startsWith: normalizedQuery,
            mode: 'insensitive',
          },
          status: 'ACTIVE',
        },
        select: {
          model: true,
        },
        distinct: ['model'],
        take: 10,
      });

      return models.map(m => m.model);
    }

    if (type === 'make') {
      // Get make suggestions only
      const makes = await prisma.listing.findMany({
        where: {
          make: {
            startsWith: normalizedQuery,
            mode: 'insensitive',
          },
          status: 'ACTIVE',
        },
        select: {
          make: true,
        },
        distinct: ['make'],
        take: 10,
      });

      return makes.map(m => m.make);
    }

    // Get both make and model suggestions
    const [makes, models] = await Promise.all([
      prisma.listing.findMany({
        where: {
          make: {
            startsWith: normalizedQuery,
            mode: 'insensitive',
          },
          status: 'ACTIVE',
        },
        select: {
          make: true,
        },
        distinct: ['make'],
        take: 5,
      }),
      prisma.listing.findMany({
        where: {
          model: {
            startsWith: normalizedQuery,
            mode: 'insensitive',
          },
          status: 'ACTIVE',
        },
        select: {
          model: true,
          make: true,
        },
        distinct: ['model'],
        take: 5,
      }),
    ]);

    const suggestions = [
      ...makes.map(m => m.make),
      ...models.map(m => `${m.make} ${m.model}`),
    ];

    return [...new Set(suggestions)].slice(0, 10);
  }

  /**
   * Get popular searches
   */
  async getPopularSearches(limit: number = 10): Promise<PopularSearch[]> {
    const redis = getRedis();
    
    if (redis) {
      try {
        // Try to get from Redis cache
        const cached = await redis.get('popular_searches');
        if (cached) {
          return JSON.parse(cached).slice(0, limit);
        }
      } catch (error) {
        console.error('Redis error getting popular searches:', error);
      }
    }

    // Get from database
    const popularMakes = await prisma.listing.groupBy({
      by: ['make'],
      where: {
        status: 'ACTIVE',
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    const popularModels = await prisma.listing.groupBy({
      by: ['make', 'model'],
      where: {
        status: 'ACTIVE',
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    const searches: PopularSearch[] = [
      ...popularMakes.map(item => ({
        term: item.make,
        count: item._count._all,
        type: 'make' as const,
      })),
      ...popularModels.map(item => ({
        term: `${item.make} ${item.model}`,
        count: item._count._all,
        type: 'make_model' as const,
      })),
    ];

    // Sort by count and take top results
    const sortedSearches = searches
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    // Cache in Redis for 1 hour
    if (redis) {
      try {
        await redis.set(
          'popular_searches',
          JSON.stringify(sortedSearches),
          'EX',
          3600
        );
      } catch (error) {
        console.error('Redis error caching popular searches:', error);
      }
    }

    return sortedSearches;
  }

  /**
   * Create a search alert
   */
  async createSearchAlert(
    userId: string,
    data: SearchAlertData
  ): Promise<SearchAlert> {
    // Check if user has reached the alert limit
    const alertCount = await prisma.searchAlert.count({
      where: { userId, isActive: true },
    });

    if (alertCount >= 10) {
      throw new Error('Maximum number of search alerts (10) reached');
    }

    const alert = await prisma.searchAlert.create({
      data: {
        userId,
        name: data.name,
        filters: data.filters as Prisma.JsonObject,
        frequency: data.frequency,
        isActive: true,
      },
    });

    // Queue instant alert processing if frequency is INSTANT
    if (data.frequency === 'INSTANT') {
      const queue = getSearchAlertsQueue();
      if (queue) {
        await queue.add(
          JOB_NAMES.PROCESS_INSTANT_ALERTS,
          { alertId: alert.id },
          { delay: 5000 } // Small delay to ensure listing is indexed
        );
      }
    }

    return alert;
  }

  /**
   * Get user's search alerts
   */
  async getUserSearchAlerts(userId: string): Promise<SearchAlert[]> {
    return prisma.searchAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update a search alert
   */
  async updateSearchAlert(
    alertId: string,
    userId: string,
    data: Partial<SearchAlertData> & { isActive?: boolean }
  ): Promise<SearchAlert> {
    // Verify ownership
    const alert = await prisma.searchAlert.findFirst({
      where: { id: alertId, userId },
    });

    if (!alert) {
      throw new Error('Search alert not found');
    }

    return prisma.searchAlert.update({
      where: { id: alertId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.filters && { filters: data.filters as Prisma.JsonObject }),
        ...(data.frequency && { frequency: data.frequency }),
        ...(typeof data.isActive === 'boolean' && { isActive: data.isActive }),
      },
    });
  }

  /**
   * Delete a search alert
   */
  async deleteSearchAlert(alertId: string, userId: string): Promise<void> {
    const alert = await prisma.searchAlert.findFirst({
      where: { id: alertId, userId },
    });

    if (!alert) {
      throw new Error('Search alert not found');
    }

    await prisma.searchAlert.delete({
      where: { id: alertId },
    });
  }

  /**
   * Test a search alert by sending it immediately
   */
  async testSearchAlert(alertId: string, userId: string): Promise<void> {
    const alert = await prisma.searchAlert.findFirst({
      where: { id: alertId, userId },
      include: { user: true },
    });

    if (!alert) {
      throw new Error('Search alert not found');
    }

    // Find matching listings
    const listings = await this.findMatchingListings(alert.filters as SearchFilters);

    if (listings.length > 0) {
      // Send email with matching listings
      await this.emailService.sendSearchAlertEmail(
        alert.user.email,
        alert.name,
        listings
      );
    }
  }

  /**
   * Find listings that match search filters
   */
  async findMatchingListings(
    filters: SearchFilters,
    limit: number = 20
  ): Promise<Listing[]> {
    const where: Prisma.ListingWhereInput = {
      status: 'ACTIVE',
    };

    if (filters.make) {
      where.make = {
        equals: filters.make,
        mode: 'insensitive',
      };
    }

    if (filters.model) {
      where.model = {
        equals: filters.model,
        mode: 'insensitive',
      };
    }

    if (filters.yearMin || filters.yearMax) {
      where.year = {};
      if (filters.yearMin) where.year.gte = filters.yearMin;
      if (filters.yearMax) where.year.lte = filters.yearMax;
    }

    if (filters.priceMin || filters.priceMax) {
      where.price = {};
      if (filters.priceMin) where.price.gte = filters.priceMin;
      if (filters.priceMax) where.price.lte = filters.priceMax;
    }

    if (filters.mileageMax) {
      where.mileageKm = { lte: filters.mileageMax };
    }

    if (filters.bodyType) {
      where.bodyType = {
        equals: filters.bodyType,
        mode: 'insensitive',
      };
    }

    if (filters.transmission) {
      where.transmission = {
        equals: filters.transmission,
        mode: 'insensitive',
      };
    }

    if (filters.fuelType) {
      where.fuelType = {
        equals: filters.fuelType,
        mode: 'insensitive',
      };
    }

    if (filters.drivetrain) {
      where.drivetrain = {
        equals: filters.drivetrain,
        mode: 'insensitive',
      };
    }

    if (filters.province) {
      where.province = {
        equals: filters.province,
        mode: 'insensitive',
      };
    }

    if (filters.city) {
      where.city = {
        equals: filters.city,
        mode: 'insensitive',
      };
    }

    if (filters.condition) {
      where.condition = {
        equals: filters.condition,
        mode: 'insensitive',
      };
    }

    return prisma.listing.findMany({
      where,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            city: true,
            province: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Process search alerts for a given frequency
   */
  async processSearchAlerts(frequency: AlertFrequency): Promise<void> {
    const now = new Date();
    let lastSentThreshold: Date;

    switch (frequency) {
      case 'INSTANT':
        // Process alerts that haven't been sent in the last hour
        lastSentThreshold = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'DAILY':
        // Process alerts that haven't been sent today
        lastSentThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'WEEKLY':
        // Process alerts that haven't been sent this week
        lastSentThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
    }

    const alerts = await prisma.searchAlert.findMany({
      where: {
        frequency,
        isActive: true,
        OR: [
          { lastSentAt: null },
          { lastSentAt: { lt: lastSentThreshold } },
        ],
      },
      include: { user: true },
    });

    console.log(`Processing ${alerts.length} ${frequency} alerts`);

    for (const alert of alerts) {
      try {
        // Find matching listings created since last alert
        const filters = alert.filters as SearchFilters;
        const listings = await this.findMatchingListings(filters);

        if (listings.length > 0) {
          // Filter listings created since last alert
          const newListings = alert.lastSentAt
            ? listings.filter(l => l.createdAt > alert.lastSentAt!)
            : listings;

          if (newListings.length > 0) {
            // Send email
            await this.emailService.sendSearchAlertEmail(
              alert.user.email,
              alert.name,
              newListings
            );

            // Update last sent time
            await prisma.searchAlert.update({
              where: { id: alert.id },
              data: { lastSentAt: now },
            });

            console.log(`Sent alert ${alert.id} with ${newListings.length} listings`);
          }
        }
      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error);
      }
    }
  }

  /**
   * Track a search term for popularity
   */
  async trackSearchTerm(term: string, userId?: string): Promise<void> {
    const redis = getRedis();
    
    if (!redis) return;

    try {
      const key = 'search_terms';
      const member = term.toLowerCase();
      
      // Increment the score for this search term
      await redis.zincrby(key, 1, member);
      
      // Keep only top 1000 search terms
      await redis.zremrangebyrank(key, 0, -1001);
      
      // Track user search if userId provided
      if (userId) {
        const userKey = `user_searches:${userId}`;
        await redis.lpush(userKey, JSON.stringify({
          term,
          timestamp: new Date().toISOString(),
        }));
        
        // Keep only last 50 searches per user
        await redis.ltrim(userKey, 0, 49);
        
        // Set expiry to 30 days
        await redis.expire(userKey, 30 * 24 * 60 * 60);
      }
    } catch (error) {
      console.error('Error tracking search term:', error);
    }
  }
}