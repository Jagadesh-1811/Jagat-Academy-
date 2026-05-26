import { Redis } from 'ioredis';

let redisClient = null;
let isRedisEnabled = false;

// Robust In-Memory Mock database for sorted set leaderboards and general caching
class InMemoryRedisMock {
  constructor() {
    this.store = new Map(); // For standard key-value get/set
    this.sortedSets = new Map(); // For leaderboard sorted sets
    console.log('🤖 LMS Gamification: Using local in-memory fallback for caching and leaderboards.');
  }

  async get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key, value, expiryFlag, ttlSeconds) {
    let expiresAt = null;
    if (expiryFlag === 'EX' && ttlSeconds) {
      expiresAt = Date.now() + ttlSeconds * 1000;
    }
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(key) {
    this.store.delete(key);
    this.sortedSets.delete(key);
    return 1;
  }

  // Sorted sets mock operations (needed for leaderboards)
  async zadd(key, score, member) {
    if (!this.sortedSets.has(key)) {
      this.sortedSets.set(key, new Map());
    }
    const set = this.sortedSets.get(key);
    set.set(String(member), Number(score));
    return 1;
  }

  async zscore(key, member) {
    const set = this.sortedSets.get(key);
    if (!set) return null;
    const score = set.get(String(member));
    return score !== undefined ? String(score) : null;
  }

  async zrevrank(key, member) {
    const set = this.sortedSets.get(key);
    if (!set) return null;
    
    // Sort members descending by score
    const sorted = [...set.entries()].sort((a, b) => b[1] - a[1]);
    const rank = sorted.findIndex(([m]) => m === String(member));
    return rank !== -1 ? rank : null;
  }

  async zrevrange(key, start, stop, withScoresOption) {
    const set = this.sortedSets.get(key);
    if (!set) return [];

    // Sort descending by score
    const sorted = [...set.entries()].sort((a, b) => b[1] - a[1]);
    const sliced = sorted.slice(start, stop === -1 ? undefined : stop + 1);

    if (withScoresOption === 'WITHSCORES') {
      const result = [];
      for (const [member, score] of sliced) {
        result.push(member, String(score));
      }
      return result;
    }

    return sliced.map(([member]) => member);
  }
}

// Attempt to connect to real Redis if REDIS_URL exists in process.env
const initRedis = () => {
  const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST;

  if (redisUrl) {
    try {
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy(times) {
          if (times > 2) {
            console.log('⚠️ Redis connection attempts failed. Switching to InMemoryRedisMock...');
            return null; // Stop retrying
          }
          return Math.min(times * 100, 1000);
        }
      });

      redisClient.on('connect', () => {
        isRedisEnabled = true;
        console.log('⚡ Redis connected successfully for caching & leaderboard acceleration.');
      });

      redisClient.on('error', (err) => {
        // Suppress repeated logs, fallback automatically handles failures
        isRedisEnabled = false;
      });
    } catch (err) {
      console.log('⚠️ Redis initialization exception. Activating InMemoryRedisMock...');
      redisClient = new InMemoryRedisMock();
    }
  } else {
    redisClient = new InMemoryRedisMock();
  }
};

initRedis();

// If ioredis failed/errored or wasn't configured, wrap methods so they fall back gracefully to local memory
const redisWrapper = {
  get: async (key) => {
    try {
      if (isRedisEnabled) return await redisClient.get(key);
    } catch {}
    return await fallbackMock.get(key);
  },
  set: async (key, value, expiryFlag, ttlSeconds) => {
    try {
      if (isRedisEnabled) return await redisClient.set(key, value, expiryFlag, ttlSeconds);
    } catch {}
    return await fallbackMock.set(key, value, expiryFlag, ttlSeconds);
  },
  del: async (key) => {
    try {
      if (isRedisEnabled) return await redisClient.del(key);
    } catch {}
    return await fallbackMock.del(key);
  },
  zadd: async (key, score, member) => {
    try {
      if (isRedisEnabled) return await redisClient.zadd(key, score, member);
    } catch {}
    return await fallbackMock.zadd(key, score, member);
  },
  zscore: async (key, member) => {
    try {
      if (isRedisEnabled) return await redisClient.zscore(key, member);
    } catch {}
    return await fallbackMock.zscore(key, member);
  },
  zrevrank: async (key, member) => {
    try {
      if (isRedisEnabled) return await redisClient.zrevrank(key, member);
    } catch {}
    return await fallbackMock.zrevrank(key, member);
  },
  zrevrange: async (key, start, stop, withScoresOption) => {
    try {
      if (isRedisEnabled) return await redisClient.zrevrange(key, start, stop, withScoresOption);
    } catch {}
    return await fallbackMock.zrevrange(key, start, stop, withScoresOption);
  }
};

const fallbackMock = new InMemoryRedisMock();

export default redisWrapper;
export { isRedisEnabled };
