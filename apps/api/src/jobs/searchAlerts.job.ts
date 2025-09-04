import Bull from 'bull';
import { SearchService } from '../services/search.service';
import { getSearchAlertsQueue, JOB_NAMES } from '../config/queue';
import { AlertFrequency } from '@prisma/client';
import prisma from '../config/database';

export class SearchAlertsJob {
  private searchService: SearchService;
  private queue: Bull.Queue | null;

  constructor() {
    this.searchService = new SearchService();
    this.queue = getSearchAlertsQueue();
    this.setupJobProcessors();
  }

  /**
   * Setup job processors
   */
  private setupJobProcessors(): void {
    if (!this.queue) {
      console.log('Search alerts queue not available - jobs will not be processed');
      return;
    }

    // Process instant alerts
    this.queue.process(JOB_NAMES.PROCESS_INSTANT_ALERTS, async (job) => {
      console.log('Processing instant alert job:', job.data);
      
      if (job.data.alertId) {
        // Process single alert
        await this.processSingleAlert(job.data.alertId);
      } else {
        // Process all instant alerts
        await this.searchService.processSearchAlerts('INSTANT');
      }
    });

    // Process daily alerts
    this.queue.process(JOB_NAMES.PROCESS_DAILY_ALERTS, async (job) => {
      console.log('Processing daily alerts job');
      await this.searchService.processSearchAlerts('DAILY');
    });

    // Process weekly alerts
    this.queue.process(JOB_NAMES.PROCESS_WEEKLY_ALERTS, async (job) => {
      console.log('Processing weekly alerts job');
      await this.searchService.processSearchAlerts('WEEKLY');
    });

    // Queue event handlers
    this.queue.on('completed', (job) => {
      console.log(`Job ${job.name} completed successfully`);
    });

    this.queue.on('failed', (job, err) => {
      console.error(`Job ${job?.name} failed:`, err.message);
    });
  }

  /**
   * Schedule recurring alert jobs
   */
  async scheduleRecurringJobs(): Promise<void> {
    if (!this.queue) {
      console.log('Cannot schedule recurring jobs - queue not available');
      return;
    }

    try {
      // Schedule instant alerts to run every 15 minutes
      await this.queue.add(
        JOB_NAMES.PROCESS_INSTANT_ALERTS,
        {},
        {
          repeat: {
            cron: '*/15 * * * *', // Every 15 minutes
          },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      // Schedule daily alerts to run at 9 AM every day
      await this.queue.add(
        JOB_NAMES.PROCESS_DAILY_ALERTS,
        {},
        {
          repeat: {
            cron: '0 9 * * *', // Every day at 9 AM
          },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      // Schedule weekly alerts to run every Monday at 9 AM
      await this.queue.add(
        JOB_NAMES.PROCESS_WEEKLY_ALERTS,
        {},
        {
          repeat: {
            cron: '0 9 * * 1', // Every Monday at 9 AM
          },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      console.log('Recurring search alert jobs scheduled');
    } catch (error) {
      console.error('Error scheduling recurring search alert jobs:', error);
    }
  }

  /**
   * Process a single alert
   */
  private async processSingleAlert(alertId: string): Promise<void> {
    try {
      const alert = await prisma.searchAlert.findUnique({
        where: { id: alertId },
        include: { user: true },
      });

      if (!alert || !alert.isActive) {
        console.log(`Alert ${alertId} not found or inactive`);
        return;
      }

      const filters = alert.filters as any;
      const listings = await this.searchService.findMatchingListings(filters);

      if (listings.length > 0) {
        // Filter listings created after the alert
        const newListings = listings.filter(l => l.createdAt > alert.createdAt);

        if (newListings.length > 0) {
          // Send email notification
          const { EmailService } = await import('../services/email.service');
          const emailService = new EmailService();

          await emailService.sendSearchAlertEmail(
            alert.user.email,
            alert.name,
            newListings
          );

          // Update last sent time
          await prisma.searchAlert.update({
            where: { id: alertId },
            data: { lastSentAt: new Date() },
          });

          console.log(`Sent instant alert ${alertId} with ${newListings.length} new listings`);
        }
      }
    } catch (error) {
      console.error(`Error processing single alert ${alertId}:`, error);
      throw error;
    }
  }

  /**
   * Queue an instant alert for a new listing
   */
  async queueInstantAlertsForListing(listingId: string): Promise<void> {
    if (!this.queue) return;

    try {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
      });

      if (!listing || listing.status !== 'ACTIVE') return;

      // Find matching instant alerts
      const alerts = await prisma.searchAlert.findMany({
        where: {
          frequency: 'INSTANT',
          isActive: true,
        },
      });

      for (const alert of alerts) {
        const filters = alert.filters as any;
        
        // Check if listing matches filters
        if (this.doesListingMatchFilters(listing, filters)) {
          await this.queue.add(
            JOB_NAMES.PROCESS_INSTANT_ALERTS,
            { alertId: alert.id },
            {
              delay: 5000, // 5 second delay
              removeOnComplete: true,
            }
          );
        }
      }
    } catch (error) {
      console.error('Error queuing instant alerts for listing:', error);
    }
  }

  /**
   * Check if a listing matches search filters
   */
  private doesListingMatchFilters(listing: any, filters: any): boolean {
    if (filters.make && listing.make.toLowerCase() !== filters.make.toLowerCase()) {
      return false;
    }

    if (filters.model && listing.model.toLowerCase() !== filters.model.toLowerCase()) {
      return false;
    }

    if (filters.yearMin && listing.year < filters.yearMin) {
      return false;
    }

    if (filters.yearMax && listing.year > filters.yearMax) {
      return false;
    }

    if (filters.priceMin && Number(listing.price) < filters.priceMin) {
      return false;
    }

    if (filters.priceMax && Number(listing.price) > filters.priceMax) {
      return false;
    }

    if (filters.mileageMax && listing.mileageKm > filters.mileageMax) {
      return false;
    }

    if (filters.bodyType && listing.bodyType.toLowerCase() !== filters.bodyType.toLowerCase()) {
      return false;
    }

    if (filters.transmission && listing.transmission.toLowerCase() !== filters.transmission.toLowerCase()) {
      return false;
    }

    if (filters.fuelType && listing.fuelType.toLowerCase() !== filters.fuelType.toLowerCase()) {
      return false;
    }

    if (filters.drivetrain && listing.drivetrain.toLowerCase() !== filters.drivetrain.toLowerCase()) {
      return false;
    }

    if (filters.province && listing.province.toLowerCase() !== filters.province.toLowerCase()) {
      return false;
    }

    if (filters.city && listing.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }

    if (filters.condition && listing.condition.toLowerCase() !== filters.condition.toLowerCase()) {
      return false;
    }

    return true;
  }

  /**
   * Clean up completed jobs
   */
  async cleanupJobs(): Promise<void> {
    if (!this.queue) return;

    try {
      const [completed, failed] = await Promise.all([
        this.queue.clean(24 * 60 * 60 * 1000, 'completed'), // Clean completed jobs older than 24 hours
        this.queue.clean(7 * 24 * 60 * 60 * 1000, 'failed'), // Clean failed jobs older than 7 days
      ]);

      console.log(`Cleaned up ${completed.length} completed and ${failed.length} failed search alert jobs`);
    } catch (error) {
      console.error('Error cleaning up search alert jobs:', error);
    }
  }
}