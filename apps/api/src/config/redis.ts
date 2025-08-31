import Redis from 'ioredis';

let redis: Redis | null = null;

export const connectRedis = async () => {
  try {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    await redis.ping();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
};

export const getRedis = () => {
  if (!redis) {
    throw new Error('Redis not initialized');
  }
  return redis;
};

export default redis;