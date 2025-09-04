import Bull from 'bull';
import { getRedis } from './redis';

// Queue names
export const QUEUE_NAMES = {
  SEARCH_ALERTS: 'search-alerts',
  ANALYTICS: 'analytics',
  EMAIL: 'email',
} as const;

// Job names
export const JOB_NAMES = {
  PROCESS_INSTANT_ALERTS: 'process-instant-alerts',
  PROCESS_DAILY_ALERTS: 'process-daily-alerts',
  PROCESS_WEEKLY_ALERTS: 'process-weekly-alerts',
  AGGREGATE_ANALYTICS: 'aggregate-analytics',
  CLEANUP_ANALYTICS: 'cleanup-analytics',
  SEND_EMAIL: 'send-email',
  SEND_ALERT_EMAIL: 'send-alert-email',
} as const;

// Queue options
const defaultQueueOptions: Bull.QueueOptions = {
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 100,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
};

// Create queue factory
export const createQueue = (name: string): Bull.Queue | null => {
  const redis = getRedis();
  
  if (!redis) {
    console.warn(`Queue ${name} not created - Redis not available`);
    return null;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  return new Bull(name, redisUrl, defaultQueueOptions);
};

// Queue instances
let searchAlertsQueue: Bull.Queue | null = null;
let analyticsQueue: Bull.Queue | null = null;
let emailQueue: Bull.Queue | null = null;

// Initialize queues
export const initializeQueues = (): void => {
  searchAlertsQueue = createQueue(QUEUE_NAMES.SEARCH_ALERTS);
  analyticsQueue = createQueue(QUEUE_NAMES.ANALYTICS);
  emailQueue = createQueue(QUEUE_NAMES.EMAIL);
  
  if (searchAlertsQueue) {
    console.log('Search alerts queue initialized');
  }
  
  if (analyticsQueue) {
    console.log('Analytics queue initialized');
  }
  
  if (emailQueue) {
    console.log('Email queue initialized');
  }
};

// Get queue instances
export const getSearchAlertsQueue = (): Bull.Queue | null => searchAlertsQueue;
export const getAnalyticsQueue = (): Bull.Queue | null => analyticsQueue;
export const getEmailQueue = (): Bull.Queue | null => emailQueue;

// Clean up queues
export const closeQueues = async (): Promise<void> => {
  const queues = [searchAlertsQueue, analyticsQueue, emailQueue];
  
  await Promise.all(
    queues
      .filter(queue => queue !== null)
      .map(queue => queue!.close())
  );
  
  console.log('All queues closed');
};