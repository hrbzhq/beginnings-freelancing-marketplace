import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Redis connection
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Queue definitions
export const scrapeQueue = new Queue('scrape-jobs', { connection });
export const analysisQueue = new Queue('ai-analysis', { connection });
export const reportQueue = new Queue('generate-report', { connection });
export const evaluationQueue = new Queue('weekly-evaluation', { connection });

// Queue configurations
export const queueOptions = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: 50,
  removeOnFail: 20,
};

// Export connection for cleanup
export { connection };
