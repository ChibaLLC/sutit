import { Redis } from "iovalkey";

let redisClient: Redis | null = null;
let isConnecting = false;

const createRedisClient = (): Redis | null => {
  const redisUrl = process.env.REDIS_URL as string;

  if (!redisUrl) {
    console.warn("⚠️ Redis URL not configured. Caching will be disabled.");
    return null;
  }

  try {
    const client = new Redis(redisUrl);

    // Handle connection events
    client.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    client.on("ready", () => {
      console.log("✅ Redis ready for operations");
    });

    client.on("error", (err) => {
      console.error("❌ Redis connection error:", err.message);
      // Don't crash the app on Redis errors
    });

    client.on("close", () => {
      console.log("🔌 Redis connection closed");
    });

    client.on("reconnecting", () => {
      console.log("🔄 Redis reconnecting...");
    });

    return client;
  } catch (error) {
    console.error("❌ Failed to initialize Redis client:", error);
    return null;
  }
};

// Get Redis client with lazy initialization
export const getRedisClient = (): Redis | null => {
  if (!redisClient && !isConnecting) {
    isConnecting = true;
    redisClient = createRedisClient();
    isConnecting = false;
  }

  return redisClient;
};

// Cache helper functions
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
};

export const cacheSet = async <T>(key: string, value: T, ttlSeconds = 300): Promise<boolean> => {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const serialized = JSON.stringify(value);
    await client.setex(key, ttlSeconds, serialized);
    return true;
  } catch (error) {
    console.error("Cache set error:", error);
    return false;
  }
};

export const cacheDel = async (key: string): Promise<boolean> => {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error("Cache delete error:", error);
    return false;
  }
};

// Pattern-based cache invalidation
export const cacheInvalidatePattern = async (pattern: string): Promise<boolean> => {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return true;
  } catch (error) {
    console.error("Cache invalidation error:", error);
    return false;
  }
};

// Graceful shutdown
export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log("✅ Redis connection closed gracefully");
    } catch (error) {
      console.error("Error closing Redis connection:", error);
    } finally {
      redisClient = null;
    }
  }
};
export const cache = {
  get: cacheGet,
  set: cacheSet,
  del: cacheDel,
};

export default getRedisClient();
