import { listingService } from './listing.service';
import { SearchAlertsJob } from '../jobs/searchAlerts.job';
import { AnalyticsJob } from '../jobs/analytics.job';
import { initializeQueues, closeQueues } from '../config/queue';

class CronService {
  private intervalIds: NodeJS.Timeout[] = [];
  private searchAlertsJob: SearchAlertsJob | null = null;
  private analyticsJob: AnalyticsJob | null = null;

  async start() {
    console.log('Starting cron jobs and job queues...');
    
    // Initialize queues
    initializeQueues();
    
    // Initialize job processors
    this.searchAlertsJob = new SearchAlertsJob();
    this.analyticsJob = new AnalyticsJob();
    
    // Schedule recurring jobs
    await this.searchAlertsJob.scheduleRecurringJobs();
    await this.analyticsJob.scheduleRecurringJobs();
    
    // Run listing expiration check every hour
    const expirationInterval = setInterval(async () => {
      try {
        console.log('Running listing expiration check...');
        const result = await listingService.expireOldListings();
        if (result && result.count > 0) {
          console.log(`Expired ${result.count} listings`);
        }
      } catch (error) {
        console.error('Error running listing expiration job:', error);
      }
    }, 60 * 60 * 1000); // Every hour

    this.intervalIds.push(expirationInterval);

    // Cleanup old jobs every day at 3 AM
    const cleanupInterval = setInterval(async () => {
      try {
        console.log('Cleaning up old jobs...');
        if (this.searchAlertsJob) {
          await this.searchAlertsJob.cleanupJobs();
        }
        if (this.analyticsJob) {
          await this.analyticsJob.cleanupJobs();
        }
      } catch (error) {
        console.error('Error cleaning up jobs:', error);
      }
    }, 24 * 60 * 60 * 1000); // Every 24 hours

    this.intervalIds.push(cleanupInterval);

    // Run initial expiration check on startup
    listingService.expireOldListings().catch(console.error);
    
    console.log('Cron jobs and job queues started successfully');
  }

  async stop() {
    console.log('Stopping cron jobs and job queues...');
    
    // Clear intervals
    this.intervalIds.forEach(id => clearInterval(id));
    this.intervalIds = [];
    
    // Close queues
    await closeQueues();
    
    console.log('Cron jobs and job queues stopped');
  }
}

export const cronService = new CronService();