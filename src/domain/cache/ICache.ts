/**
 * Cache Interface
 * Generic cache interface for caching data
 */

export interface ICache<T> {
  /**
   * Get a value from cache
   */
  get(key: string): Promise<T | null>;

  /**
   * Set a value in cache
   */
  set(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /**
   * Delete a value from cache
   */
  delete(key: string): Promise<void>;

  /**
   * Clear all cache
   */
  clear(): Promise<void>;

  /**
   * Check if key exists in cache
   */
  has(key: string): Promise<boolean>;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  defaultTtlSeconds: number;
  maxKeys?: number;
}

/**
 * Cache key generator utility
 */
export class CacheKeyGenerator {
  /**
   * Generate cache key for member
   */
  static member(familyId: string, memberId: string): string {
    return `member:${familyId}:${memberId}`;
  }

  /**
   * Generate cache key for family members
   */
  static familyMembers(familyId: string): string {
    return `members:family:${familyId}`;
  }

  /**
   * Generate cache key for family stats
   */
  static familyStats(familyId: string): string {
    return `stats:family:${familyId}`;
  }

  /**
   * Generate cache key for search results
   */
  static search(familyId: string, searchTerm: string): string {
    return `search:${familyId}:${searchTerm.toLowerCase().trim()}`;
  }

  /**
   * Generate cache key for filtered members
   */
  static filteredMembers(familyId: string, filters: string): string {
    return `filtered:${familyId}:${filters}`;
  }
}
