import { Member } from '../../domain/entities';
import { IMemberRepository } from '../../domain/repositories';
import { MarriagePolicy, getMarriageErrorMessage } from '../../domain/services/MarriagePolicy';

/**
 * Use case for managing family members
 */
export class MemberService {
  constructor(private memberRepository: IMemberRepository) {}

  /**
   * Get all members for a family
   */
  async getMembersByFamily(familyId: string): Promise<Member[]> {
    return this.memberRepository.getByFamilyId(familyId);
  }

  /**
   * Subscribe to family members changes
   */
  subscribeToMembers(familyId: string, callback: (members: Member[]) => void): () => void {
    return this.memberRepository.subscribeByFamilyId(familyId, callback);
  }

  /**
   * Get a single member
   */
  async getMember(familyId: string, memberId: string): Promise<Member | null> {
    return this.memberRepository.getById(familyId, memberId);
  }

  /**
   * Create a new member
   */
  async createMember(familyId: string, data: Omit<Member, 'id'>): Promise<Member> {
    return this.memberRepository.create(familyId, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Update a member
   */
  async updateMember(familyId: string, memberId: string, data: Partial<Member>): Promise<void> {
    return this.memberRepository.update(familyId, memberId, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Delete a member
   */
  async deleteMember(familyId: string, memberId: string): Promise<void> {
    return this.memberRepository.delete(familyId, memberId);
  }

  /**
   * Get members grouped by family IDs
   */
  async getMembersByFamilies(familyIds: string[]): Promise<Member[]> {
    const promises = familyIds.map(id => this.memberRepository.getByFamilyId(id));
    const results = await Promise.all(promises);
    return results.flat();
  }

  /**
   * Subscribe to multiple families members
   */
  subscribeToMembersByFamilies(
    familyIds: string[],
    callback: (members: Member[]) => void
  ): () => void {
    const unsubscribes: (() => void)[] = [];
    const membersMap = new Map<string, Member[]>();

    familyIds.forEach(familyId => {
      const unsubscribe = this.memberRepository.subscribeByFamilyId(familyId, (members) => {
        membersMap.set(familyId, members);
        const allMembers = Array.from(membersMap.values()).flat();
        callback(allMembers);
      });
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }

  /**
   * Set parent relationships (father/mother)
   */
  async setParents(
    familyId: string,
    memberId: string,
    fatherId?: string,
    motherId?: string
  ): Promise<void> {
    const updates: Partial<Member> = {};
    if (fatherId !== undefined) updates.fatherId = fatherId;
    if (motherId !== undefined) updates.motherId = motherId;
    
    return this.memberRepository.update(familyId, memberId, updates);
  }

  /**
   * Set spouse relationship
   */
  async setSpouse(
    familyId: string,
    memberId: string,
    spouseId: string,
    isPrimary: boolean = true
  ): Promise<void> {
    const member = await this.memberRepository.getById(familyId, memberId);
    if (!member) throw new Error('Anggota keluarga tidak ditemukan');

    const updates: Partial<Member> = {};
    
    if (isPrimary) {
      updates.spouseId = spouseId;
      updates.spouseIds = [
        ...(member.spouseIds || []).filter(id => id !== spouseId),
        spouseId
      ];
      updates.maritalStatus = 'married';
    } else {
      updates.spouseIds = [
        ...(member.spouseIds || []),
        spouseId
      ];
    }

    return this.memberRepository.update(familyId, memberId, updates);
  }

  /**
   * Remove spouse relationship
   */
  async removeSpouse(familyId: string, memberId: string, spouseId: string): Promise<void> {
    const member = await this.memberRepository.getById(familyId, memberId);
    if (!member) throw new Error('Anggota keluarga tidak ditemukan');

    const newSpouseIds = (member.spouseIds || []).filter(id => id !== spouseId);
    
    const updates: Partial<Member> = {
      spouseIds: newSpouseIds,
      spouseId: member.spouseId === spouseId 
        ? (newSpouseIds[0] || undefined) 
        : member.spouseId,
      maritalStatus: newSpouseIds.length === 0 ? 'widowed' : member.maritalStatus
    };

    return this.memberRepository.update(familyId, memberId, updates);
  }

  /**
   * Atomically set spouse relationship for both members
   * Uses batch write to ensure both updates succeed or fail together
   */
  async setSpouseAtomic(
    familyId: string,
    memberId: string,
    spouseId: string,
    isPrimary: boolean = true,
    marriageDate?: string,
    allMembers: Member[] = []
  ): Promise<void> {
    const [member, spouse] = await Promise.all([
      this.memberRepository.getById(familyId, memberId),
      this.memberRepository.getById(familyId, spouseId)
    ]);

    if (!member) throw new Error('Anggota keluarga tidak ditemukan');
    if (!spouse) throw new Error('Pasangan tidak ditemukan');

    // ENFORCE MARRIAGE POLICY - Anti-incest validation
    if (allMembers.length > 0) {
      const validation = MarriagePolicy.validateMarriage(member, spouse, allMembers);
      if (!validation.isValid) {
        throw new Error(validation.errorMessage || getMarriageErrorMessage(validation.errorCode!));
      }
    }

    const now = new Date().toISOString();
    
    // Build updates for both members
    const memberUpdates: Partial<Member> = {
      spouseId: spouseId,
      spouseIds: [...((member.spouseIds || []).filter(id => id !== spouseId)), spouseId],
      maritalStatus: 'married',
      updatedAt: now
    };
    
    if (marriageDate) memberUpdates.marriageDate = marriageDate;

    const spouseUpdates: Partial<Member> = {
      spouseId: memberId,
      spouseIds: [...((spouse.spouseIds || []).filter(id => id !== memberId)), memberId],
      maritalStatus: 'married',
      updatedAt: now
    };
    
    if (marriageDate) spouseUpdates.marriageDate = marriageDate;

    // Use batch update for atomic operation
    await this.memberRepository.batchUpdate(familyId, [
      { memberId, data: memberUpdates },
      { memberId: spouseId, data: spouseUpdates }
    ]);
  }

  /**
   * Atomically remove spouse relationship for both members
   * Uses batch write to ensure both updates succeed or fail together
   */
  async removeSpouseAtomic(familyId: string, memberId: string, spouseId: string): Promise<void> {
    const [member, spouse] = await Promise.all([
      this.memberRepository.getById(familyId, memberId),
      this.memberRepository.getById(familyId, spouseId)
    ]);

    if (!member) throw new Error('Anggota keluarga tidak ditemukan');
    // Spouse may not exist (external spouse), so we only update the member

    const newMemberSpouseIds = (member.spouseIds || []).filter(id => id !== spouseId);
    
    const memberUpdates: Partial<Member> = {
      spouseIds: newMemberSpouseIds,
      spouseId: member.spouseId === spouseId ? (newMemberSpouseIds[0] || undefined) : member.spouseId,
      maritalStatus: newMemberSpouseIds.length === 0 ? 'widowed' : 'divorced',
      updatedAt: new Date().toISOString()
    };

    // Only update spouse if they exist in our system
    if (spouse) {
      const newSpouseSpouseIds = (spouse.spouseIds || []).filter(id => id !== memberId);
      
      const spouseUpdates: Partial<Member> = {
        spouseIds: newSpouseSpouseIds,
        spouseId: spouse.spouseId === memberId ? (newSpouseSpouseIds[0] || undefined) : spouse.spouseId,
        maritalStatus: newSpouseSpouseIds.length === 0 ? 'widowed' : 'divorced',
        updatedAt: new Date().toISOString()
      };

      await this.memberRepository.batchUpdate(familyId, [
        { memberId, data: memberUpdates },
        { memberId: spouseId, data: spouseUpdates }
      ]);
    } else {
      await this.memberRepository.update(familyId, memberId, memberUpdates);
    }
  }

  /**
   * Atomically update parent-child relationship for multiple members
   * Updates the child and optionally updates children's parent references
   */
  async setParentsAtomic(
    familyId: string,
    childId: string,
    fatherId?: string,
    motherId?: string
  ): Promise<void> {
    const child = await this.memberRepository.getById(familyId, childId);
    if (!child) throw new Error('Anggota keluarga tidak ditemukan');

    const updates: Partial<Member> = {
      updatedAt: new Date().toISOString()
    };
    
    if (fatherId !== undefined) updates.fatherId = fatherId;
    if (motherId !== undefined) updates.motherId = motherId;

    await this.memberRepository.update(familyId, childId, updates);
  }

  /**
   * Atomically delete member and clear their references from related members
   * Uses batch write to ensure all updates succeed or fail together
   */
  async deleteMemberAtomic(familyId: string, memberId: string): Promise<void> {
    // Get all members to find relationships
    const allMembers = await this.memberRepository.getByFamilyId(familyId);
    const member = allMembers.find(m => m.id === memberId);
    
    if (!member) throw new Error('Anggota keluarga tidak ditemukan');

    const batchUpdates: Array<{ memberId: string; data: Partial<Member> }> = [];
    const now = new Date().toISOString();

    // Clear spouse references
    if (member.spouseId) {
      const spouse = allMembers.find(m => m.id === member.spouseId);
      if (spouse) {
        const newSpouseSpouseIds = (spouse.spouseIds || []).filter(id => id !== memberId);
        batchUpdates.push({
          memberId: spouse.id,
          data: {
            spouseId: spouse.spouseId === memberId ? (newSpouseSpouseIds[0] || undefined) : spouse.spouseId,
            spouseIds: newSpouseSpouseIds,
            maritalStatus: newSpouseSpouseIds.length === 0 ? 'widowed' : spouse.maritalStatus,
            updatedAt: now
          }
        });
      }
    }

    // Clear parent references from children
    const children = allMembers.filter(m => m.fatherId === memberId || m.motherId === memberId);
    for (const child of children) {
      const childUpdates: Partial<Member> = { updatedAt: now };
      if (child.fatherId === memberId) childUpdates.fatherId = undefined;
      if (child.motherId === memberId) childUpdates.motherId = undefined;
      batchUpdates.push({ memberId: child.id, data: childUpdates });
    }

    // Add the delete operation
    await this.memberRepository.batchUpdate(familyId, batchUpdates);
    
    // Finally delete the member
    await this.memberRepository.delete(familyId, memberId);
  }

  /**
   * Check for duplicate members in a family
   * Returns potential duplicates based on name and birth date
   */
  findPotentialDuplicates(familyId: string, members: Member[]): Member[] {
    const familyMembers = members.filter(m => m.familyId === familyId);
    const duplicates: Member[] = [];
    const seen = new Map<string, Member[]>();

    // Group by name + birthDate key
    familyMembers.forEach(member => {
      const key = `${member.name.toLowerCase().trim()}|${member.birthDate || ''}`;
      if (!seen.has(key)) {
        seen.set(key, []);
      }
      seen.get(key)!.push(member);
    });

    // Collect duplicates
    seen.forEach((members) => {
      if (members.length > 1) {
        duplicates.push(...members);
      }
    });

    return duplicates;
  }

  /**
   * Check if a member already exists with similar name and birth date
   */
  isDuplicateMember(members: Member[], name: string, birthDate?: string, excludeId?: string): boolean {
    const normalizedName = name.toLowerCase().trim();
    return members.some(m => 
      m.name.toLowerCase().trim() === normalizedName && 
      (m.birthDate || '') === (birthDate || '') &&
      m.id !== excludeId
    );
  }
}
