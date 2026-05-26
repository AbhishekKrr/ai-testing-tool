import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
    const isTLS = redisUrl.startsWith('rediss://');
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: null, // required by BullMQ
      lazyConnect: true,
      ...(isTLS ? { tls: {} } : {}),
    });
    redis.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message);
    });
    redis.on('connect', () => {
      console.log('[Redis] Connected');
    });
  }
  return redis;
}

const CACHE_TTL = 60 * 60; // 1 hour

export async function cacheSet(key: string, value: unknown, ttl = CACHE_TTL): Promise<void> {
  try {
    await getRedis().set(`veda:${key}`, JSON.stringify(value), 'EX', ttl);
  } catch (err) {
    console.error('[Cache] Set error:', err);
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await getRedis().get(`veda:${key}`);
    if (!val) return null;
    return JSON.parse(val) as T;
  } catch (err) {
    console.error('[Cache] Get error:', err);
    return null;
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await getRedis().del(`veda:${key}`);
  } catch (err) {
    console.error('[Cache] Del error:', err);
  }
}

export async function setJobStatus(
  jobId: string,
  status: object
): Promise<void> {
  await cacheSet(`job:${jobId}`, status, 60 * 30); // 30 min TTL
}

export async function getJobStatus(jobId: string): Promise<unknown> {
  return cacheGet(`job:${jobId}`);
}
