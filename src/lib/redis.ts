import { createClient } from 'redis';

// Use local Redis for development
export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Connect to Redis
redis.connect().catch(console.error);
