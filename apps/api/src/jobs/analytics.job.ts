import Bull from 'bull';
import { AnalyticsService } from '../services/analytics.service';
import { getAnalyticsQueue, JOB_NAMES } from '../config/queue';

export class AnalyticsJob {
  private analyticsService: AnalyticsService;
  private queue: Bull.Queue | null;

  constructor() {
    this.analyticsService = new AnalyticsService();
    this.queue = getAnalyticsQueue();
    this.setupJobProcessors();
  }

  /**
   * Setup job processors
   */
  private setupJobProcessors(): void {
    if (!this.queue) {
      console.log('Analytics queue not available - jobs will not be processed');
      return;
    }

    // Process analytics aggregation
    this.queue.process(JOB_NAMES.AGGREGATE_ANALYTICS, async (job) => {
      console.log('Processing analytics aggregation job');
      await this.analyticsService.aggregateDailyAnalytics();
    });

    // Process analytics cleanup
    this.queue.process(JOB_NAMES.CLEANUP_ANALYTICS, async (job) => {
      console.log('Processing analytics cleanup job');
      const daysToKeep = job.data.daysToKeep || 90;
      await this.analyticsService.cleanupOldAnalytics(daysToKeep);
    });

    // Queue event handlers
    this.queue.on('completed', (job) => {
      console.log(`Analytics job ${job.name} completed successfully`);
    });

    this.queue.on('failed', (job, err) => {
      console.error(`Analytics job ${job?.name} failed:`, err.message);
    });

    this.queue.on('stalled', (job) => {
      console.warn(`Analytics job ${job?.name} stalled and will be retried`);
    });
  }

  /**
   * Schedule recurring analytics jobs
   */
  async scheduleRecurringJobs(): Promise<void> {
    if (!this.queue) {
      console.log('Cannot schedule recurring analytics jobs - queue not available');
      return;
    }

    try {
      // Schedule daily aggregation to run at 2 AM every day
      await this.queue.add(
        JOB_NAMES.AGGREGATE_ANALYTICS,
        {},
        {
          repeat: {
            cron: '0 2 * * *', // Every day at 2 AM
          },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      // Schedule cleanup to run weekly on Sundays at 3 AM
      await this.queue.add(
        JOB_NAMES.CLEANUP_ANALYTICS,
        { daysToKeep: 90 },
        {
          repeat: {
            cron: '0 3 * * 0', // Every Sunday at 3 AM
          },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      console.log('Recurring analytics jobs scheduled');
    } catch (error) {
      console.error('Error scheduling recurring analytics jobs:', error);
    }
  }

  /**
   * Queue a one-time analytics aggregation
   */
  async queueAggregation(delay: number = 0): Promise<void> {
    if (!this.queue) return;

    try {
      await this.queue.add(
        JOB_NAMES.AGGREGATE_ANALYTICS,
        {},
        {
          delay,
          removeOnComplete: true,
        }
      );
      console.log('Analytics aggregation job queued');
    } catch (error) {
      console.error('Error queuing analytics aggregation:', error);
    }
  }

  /**
   * Queue a one-time cleanup
   */
  async queueCleanup(daysToKeep: number = 90, delay: number = 0): Promise<void> {
    if (!this.queue) return;

    try {
      await this.queue.add(
        JOB_NAMES.CLEANUP_ANALYTICS,
        { daysToKeep },
        {
          delay,
          removeOnComplete: true,
        }
      );
      console.log('Analytics cleanup job queued');
    } catch (error) {
      console.error('Error queuing analytics cleanup:', error);
    }
  }

  /**
   * Get job statistics
   */
  async getJobStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  } | null> {
    if (!this.queue) return null;

    try {
      const [waiting, active, completed, failed] = await Promise.all([
        this.queue.getWaitingCount(),
        this.queue.getActiveCount(),
        this.queue.getCompletedCount(),
        this.queue.getFailedCount(),
      ]);

      return {
        waiting,
        active,
        completed,
        failed,
      };
    } catch (error) {
      console.error('Error getting analytics job stats:', error);
      return null;
    }
  }

  /**
   * Clean up old jobs
   */
  async cleanupJobs(): Promise<void> {
    if (!this.queue) return;

    try {
      const [completed, failed] = await Promise.all([
        this.queue.clean(24 * 60 * 60 * 1000, 'completed'), // Clean completed jobs older than 24 hours
        this.queue.clean(7 * 24 * 60 * 60 * 1000, 'failed'), // Clean failed jobs older than 7 days
      ]);

      console.log(`Cleaned up ${completed.length} completed and ${failed.length} failed analytics jobs`);
    } catch (error) {
      console.error('Error cleaning up analytics jobs:', error);
    }
  }

  /**
   * Pause all analytics jobs
   */
  async pauseJobs(): Promise<void> {
    if (!this.queue) return;

    try {
      await this.queue.pause();
      console.log('Analytics jobs paused');
    } catch (error) {
      console.error('Error pausing analytics jobs:', error);
    }
  }

  /**
   * Resume all analytics jobs
   */
  async resumeJobs(): Promise<void> {
    if (!this.queue) return;

    try {
      await this.queue.resume();
      console.log('Analytics jobs resumed');
    } catch (error) {
      console.error('Error resuming analytics jobs:', error);
    }
  }

  /**
   * Remove all repeatable jobs
   */
  async removeRepeatableJobs(): Promise<void> {
    if (!this.queue) return;

    try {
      const repeatableJobs = await this.queue.getRepeatableJobs();
      
      for (const job of repeatableJobs) {
        await this.queue.removeRepeatableByKey(job.key);
      }
      
      console.log(`Removed ${repeatableJobs.length} repeatable analytics jobs`);
    } catch (error) {
      console.error('Error removing repeatable analytics jobs:', error);
    }
  }
}