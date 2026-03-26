import { Member } from '../../domain/entities';
import { IMemberRepository } from '../../domain/repositories';

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
}
