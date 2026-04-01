/**
 * Cached Member Repository
 * Wraps the existing member repository with caching
 */

import { Member } from '../../domain/entities';
import { IMemberRepository } from '../../domain/repositories/IMemberRepository';
import { ICache } from '../../domain/cache/ICache';
import { CacheKeyGenerator } from '../../domain/cache/ICache';

export class CachedMemberRepository implements IMemberRepository {
  constructor(
    private repository: IMemberRepository,
    private cache: ICache<Member[]>,
    private memberCache: ICache<Member>
  ) {}

  /**
   * Get all members for a specific family
   */
  async getByFamilyId(familyId: string): Promise<Member[]> {
    const cacheKey = CacheKeyGenerator.familyMembers(familyId);

    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from repository
    const members = await this.repository.getByFamilyId(familyId);

    // Cache the result
    await this.cache.set(cacheKey, members, 300); // 5 minutes TTL

    return members;
  }

  /**
   * Get a single member by ID
   */
  async getById(familyId: string, memberId: string): Promise<Member | null> {
    const cacheKey = CacheKeyGenerator.member(familyId, memberId);

    // Try cache first
    const cached = await this.memberCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from repository
    const member = await this.repository.getById(familyId, memberId);

    // Cache the result
    if (member) {
      await this.memberCache.set(cacheKey, member, 300); // 5 minutes TTL
    }

    return member;
  }

  /**
   * Create a new member
   */
  async create(familyId: string, member: Omit<Member, 'id'>): Promise<Member> {
    const result = await this.repository.create(familyId, member);

    // Invalidate family members cache
    await this.cache.delete(CacheKeyGenerator.familyMembers(familyId));

    // Cache the new member
    await this.memberCache.set(
      CacheKeyGenerator.member(familyId, result.id),
      result,
      300
    );

    return result;
  }

  /**
   * Update an existing member
   */
  async update(familyId: string, memberId: string, data: Partial<Member>): Promise<void> {
    await this.repository.update(familyId, memberId, data);

    // Invalidate caches
    await this.cache.delete(CacheKeyGenerator.familyMembers(familyId));
    await this.memberCache.delete(CacheKeyGenerator.member(familyId, memberId));
  }

  /**
   * Delete a member
   */
  async delete(familyId: string, memberId: string): Promise<void> {
    await this.repository.delete(familyId, memberId);

    // Invalidate caches
    await this.cache.delete(CacheKeyGenerator.familyMembers(familyId));
    await this.memberCache.delete(CacheKeyGenerator.member(familyId, memberId));
  }

  /**
   * Subscribe to family members changes (real-time updates)
   */
  subscribeByFamilyId(familyId: string, callback: (members: Member[]) => void): () => void {
    // Subscribe to repository
    const unsubscribe = this.repository.subscribeByFamilyId(familyId, async (members) => {
      // Update cache
      const cacheKey = CacheKeyGenerator.familyMembers(familyId);
      await this.cache.set(cacheKey, members, 300);

      // Call original callback
      callback(members);
    });

    return unsubscribe;
  }

  /**
   * Batch update multiple members atomically using a write batch
   */
  async batchUpdate(familyId: string, updates: Array<{ memberId: string; data: Partial<Member> }>): Promise<void> {
    await this.repository.batchUpdate(familyId, updates);

    // Invalidate family members cache
    await this.cache.delete(CacheKeyGenerator.familyMembers(familyId));

    // Invalidate individual member caches
    for (const update of updates) {
      await this.memberCache.delete(CacheKeyGenerator.member(familyId, update.memberId));
    }
  }
}
