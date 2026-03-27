/**
 * Spouse Sync Utilities
 * Functions for syncing marital status between spouses
 */

import { Member } from '../../domain/entities';
import { MemberService } from '../../application/services/MemberService';

/**
 * Update spouse relationship when a member gets a new spouse
 * Sets both members' status to married and syncs marriage date
 */
export const syncSpouseOnAdd = async (
  memberService: MemberService,
  familyId: string,
  memberId: string,
  spouseId: string,
  marriageDate?: string
): Promise<void> => {
  try {
    await memberService.updateMember(familyId, spouseId, {
      spouseId: memberId,
      maritalStatus: 'married',
      ...(marriageDate ? { marriageDate } : {}),
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Failed to update spouse when adding:', spouseId);
  }
};

/**
 * Clear spouse relationship when a member's spouse is removed
 * Sets ex-spouse's status back to single
 */
export const syncSpouseOnRemove = async (
  memberService: MemberService,
  familyId: string,
  spouseId: string
): Promise<void> => {
  try {
    await memberService.updateMember(familyId, spouseId, {
      spouseId: '',
      maritalStatus: 'single',
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Failed to update spouse when removing:', spouseId);
  }
};

/**
 * Update spouse when member is deleted
 * Sets surviving spouse's status to single
 */
export const syncSpouseOnDelete = async (
  memberService: MemberService,
  familyId: string,
  spouseId: string
): Promise<void> => {
  try {
    await memberService.updateMember(familyId, spouseId, {
      spouseId: '',
      maritalStatus: 'single',
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Failed to update spouse when deleting:', spouseId);
  }
};

/**
 * Handle spouse changes when updating a member
 */
export const handleSpouseChanges = async (
  memberService: MemberService,
  familyId: string,
  memberId: string,
  oldSpouseId: string | undefined,
  newSpouseId: string | undefined,
  marriageDate?: string
): Promise<void> => {
  if (newSpouseId !== oldSpouseId) {
    // Remove old spouse relationship
    if (oldSpouseId) {
      await syncSpouseOnRemove(memberService, familyId, oldSpouseId);
    }
    // Add new spouse relationship
    if (newSpouseId) {
      await syncSpouseOnAdd(memberService, familyId, memberId, newSpouseId, marriageDate);
    }
  }
};

/**
 * Get spouse from member list
 */
export const getSpouse = (members: Member[], member: Member): Member | undefined => {
  return member.spouseId ? members.find(m => m.id === member.spouseId) : undefined;
};

/**
 * Check if two members are married to each other
 */
export const areMarried = (member1: Member, member2: Member): boolean => {
  return member1.spouseId === member2.id && member2.spouseId === member1.id;
};

export default {
  syncSpouseOnAdd,
  syncSpouseOnRemove,
  syncSpouseOnDelete,
  handleSpouseChanges,
  getSpouse,
  areMarried
};