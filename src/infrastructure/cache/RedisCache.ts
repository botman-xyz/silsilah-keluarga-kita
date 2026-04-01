/**
 * Redis Cache Implementation
 * Redis-based cache implementation
 */

import { ICache, CacheConfig } from '../../domain/cache/ICache';

export class RedisCache<T> implements ICache<T> {
  private redis: any;
  private config: CacheConfig;

  constructor(redisClient: any, config: CacheConfig) {
    this.redis = redisClient;
    this.config = config;
  }

  /**
   * Get a value from cache
   */
  async get(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting from cache:', error);
      return null;
    }
  }

  /**
   * Set a value in cache
   */
  async set(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const ttl = ttlSeconds || this.config.defaultTtlSeconds;
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Error deleting from cache:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    try {
      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Error checking cache:', error);
      return false;
    }
  }
}

/**
 * In-Memory Cache Implementation
 * For development/testing when Redis is not available
 */
export class InMemoryCache<T> implements ICache<T> {
  private cache: Map<string, { value: T; expiresAt: number }> = new Map();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Get a value from cache
   */
  async get(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set a value in cache
   */
  async set(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds || this.config.defaultTtlSeconds;
    const expiresAt = Date.now() + ttl * 1000;

    this.cache.set(key, { value, expiresAt });

    // Enforce max keys limit
    if (this.config.maxKeys && this.cache.size > this.config.maxKeys) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}
