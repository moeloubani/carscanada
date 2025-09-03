import Redis from 'ioredis';

let redis: Redis | null = null;

export const connectRedis = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const redisOptions: any = {
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        },
      };

      if (process.env.REDIS_URL) {
        redis = new Redis(process.env.REDIS_URL, redisOptions);
      } else {
        redis = new Redis({
          host: 'localhost',
          port: 6379,
          ...redisOptions,
        });
      }
      
      redis.on('connect', () => {
        console.log('Redis connected successfully');
      });

      redis.on('error', (error) => {
        console.error('Redis connection error:', error.message);
      });

      redis.on('reconnecting', () => {
        console.log('Redis reconnecting...');
      });

      await redis.ping();
      console.log('Redis ping successful');
      break;
    } catch (error) {
      retries++;
      console.error(`Failed to connect to Redis (attempt ${retries}/${maxRetries}):`, error);
      if (retries >= maxRetries) {
        console.error('Max retries reached. Redis connection failed.');
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

export const getRedis = () => {
  return redis;
};

export default redis;