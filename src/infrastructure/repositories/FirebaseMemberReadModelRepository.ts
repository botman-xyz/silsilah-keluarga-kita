/**
 * Firebase Member Read Model Repository
 * Implements read model repository for CQRS pattern
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import {
  IMemberReadModelRepository,
  MemberReadModel,
  FamilyStatsReadModel
} from '../../domain/repositories/IMemberReadModelRepository';

export class FirebaseMemberReadModelRepository implements IMemberReadModelRepository {
  private collectionName = 'memberReadModels';
  private statsCollectionName = 'familyStats';

  /**
   * Get a single member by ID
   */
  async getById(familyId: string, memberId: string): Promise<MemberReadModel | null> {
    try {
      const docRef = doc(db, this.collectionName, `${familyId}_${memberId}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as MemberReadModel;
      }

      return null;
    } catch (error) {
      console.error('Error getting member read model:', error);
      throw error;
    }
  }

  /**
   * Get all members in a family
   */
  async getByFamilyId(familyId: string): Promise<MemberReadModel[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('familyId', '==', familyId),
        orderBy('name', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as MemberReadModel);
    } catch (error) {
      console.error('Error getting family members read model:', error);
      throw error;
    }
  }

  /**
   * Get members with filters
   */
  async getWithFilters(
    familyId: string,
    filters?: {
      gender?: 'male' | 'female' | 'other';
      hasParents?: boolean;
      hasSpouse?: boolean;
      maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
      minAge?: number;
      maxAge?: number;
    }
  ): Promise<MemberReadModel[]> {
    try {
      let q = query(
        collection(db, this.collectionName),
        where('familyId', '==', familyId)
      );

      // Apply filters
      if (filters?.gender) {
        q = query(q, where('gender', '==', filters.gender));
      }

      if (filters?.maritalStatus) {
        q = query(q, where('maritalStatus', '==', filters.maritalStatus));
      }

      if (filters?.hasParents !== undefined) {
        q = query(q, where('hasParents', '==', filters.hasParents));
      }

      if (filters?.hasSpouse !== undefined) {
        q = query(q, where('hasSpouse', '==', filters.hasSpouse));
      }

      const querySnapshot = await getDocs(q);
      let results = querySnapshot.docs.map(doc => doc.data() as MemberReadModel);

      // Apply age filters (client-side since Firestore doesn't support range queries on multiple fields)
      if (filters?.minAge !== undefined) {
        results = results.filter(m => m.age !== undefined && m.age >= filters.minAge!);
      }

      if (filters?.maxAge !== undefined) {
        results = results.filter(m => m.age !== undefined && m.age <= filters.maxAge!);
      }

      return results;
    } catch (error) {
      console.error('Error getting members with filters:', error);
      throw error;
    }
  }

  /**
   * Search members by name
   */
  async search(familyId: string, searchTerm: string): Promise<MemberReadModel[]> {
    try {
      // Get all members in the family
      const allMembers = await this.getByFamilyId(familyId);

      // Filter by search term (case-insensitive)
      const lowerSearchTerm = searchTerm.toLowerCase();
      return allMembers.filter(member =>
        member.name.toLowerCase().includes(lowerSearchTerm)
      );
    } catch (error) {
      console.error('Error searching members:', error);
      throw error;
    }
  }

  /**
   * Get family statistics
   */
  async getFamilyStats(familyId: string): Promise<FamilyStatsReadModel> {
    try {
      // Try to get cached stats
      const statsDocRef = doc(db, this.statsCollectionName, familyId);
      const statsDocSnap = await getDoc(statsDocRef);

      if (statsDocSnap.exists()) {
        return statsDocSnap.data() as FamilyStatsReadModel;
      }

      // Calculate stats from read models
      const members = await this.getByFamilyId(familyId);
      const stats = this.calculateFamilyStats(familyId, members);

      // Cache the stats
      await setDoc(statsDocRef, stats);

      return stats;
    } catch (error) {
      console.error('Error getting family stats:', error);
      throw error;
    }
  }

  /**
   * Upsert a member read model
   */
  async upsert(familyId: string, member: MemberReadModel): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, `${familyId}_${member.id}`);
      await setDoc(docRef, member, { merge: true });

      // Invalidate family stats cache
      await this.invalidateFamilyStatsCache(familyId);
    } catch (error) {
      console.error('Error upserting member read model:', error);
      throw error;
    }
  }

  /**
   * Delete a member read model
   */
  async delete(familyId: string, memberId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, `${familyId}_${memberId}`);
      await deleteDoc(docRef);

      // Invalidate family stats cache
      await this.invalidateFamilyStatsCache(familyId);
    } catch (error) {
      console.error('Error deleting member read model:', error);
      throw error;
    }
  }

  /**
   * Delete all read models for a family
   */
  async deleteByFamilyId(familyId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('familyId', '==', familyId)
      );

      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));

      await Promise.all(deletePromises);

      // Delete family stats
      const statsDocRef = doc(db, this.statsCollectionName, familyId);
      await deleteDoc(statsDocRef);
    } catch (error) {
      console.error('Error deleting family read models:', error);
      throw error;
    }
  }

  /**
   * Calculate family statistics
   */
  private calculateFamilyStats(
    familyId: string,
    members: MemberReadModel[]
  ): FamilyStatsReadModel {
    const totalMembers = members.length;
    const maleCount = members.filter(m => m.gender === 'male').length;
    const femaleCount = members.filter(m => m.gender === 'female').length;
    const otherGenderCount = members.filter(m => m.gender === 'other').length;

    const marriedCount = members.filter(m => m.maritalStatus === 'married').length;
    const singleCount = members.filter(m => m.maritalStatus === 'single').length;
    const divorcedCount = members.filter(m => m.maritalStatus === 'divorced').length;
    const widowedCount = members.filter(m => m.maritalStatus === 'widowed').length;

    const membersWithAge = members.filter(m => m.age !== undefined);
    const ages = membersWithAge.map(m => m.age!);

    const averageAge =
      ages.length > 0
        ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length)
        : undefined;

    const oldestMemberAge = ages.length > 0 ? Math.max(...ages) : undefined;
    const youngestMemberAge = ages.length > 0 ? Math.min(...ages) : undefined;

    const membersWithParents = members.filter(m => m.hasParents).length;
    const membersWithSpouse = members.filter(m => m.hasSpouse).length;

    return {
      familyId,
      totalMembers,
      maleCount,
      femaleCount,
      otherGenderCount,
      marriedCount,
      singleCount,
      divorcedCount,
      widowedCount,
      averageAge,
      oldestMemberAge,
      youngestMemberAge,
      membersWithParents,
      membersWithSpouse
    };
  }

  /**
   * Invalidate family stats cache
   */
  private async invalidateFamilyStatsCache(familyId: string): Promise<void> {
    try {
      const statsDocRef = doc(db, this.statsCollectionName, familyId);
      await deleteDoc(statsDocRef);
    } catch (error) {
      // Ignore errors when invalidating cache
      console.warn('Error invalidating family stats cache:', error);
    }
  }
}
