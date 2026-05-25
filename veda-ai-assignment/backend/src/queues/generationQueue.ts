import { Queue } from 'bullmq';
import { getRedis } from '../services/cacheService';

export const GENERATION_QUEUE = 'question-generation';

let queue: Queue | null = null;

export function getGenerationQueue(): Queue {
  if (!queue) {
    queue = new Queue(GENERATION_QUEUE, {
      connection: getRedis(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    });
  }
  return queue;
}

export interface GenerationJobData {
  assignmentId: string;
}
