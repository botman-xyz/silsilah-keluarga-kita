/**
 * App Handler Utilities
 * Helper functions for useAppHandlers
 */

import { Family, Member } from '../../domain/entities';
import { familyService, memberService } from '../../infrastructure/container';
import { toast } from 'sonner';

// =========================================
// FAMILY HELPERS
// =========================================

/**
 * Build family data for create/update (filters undefined values)
 */
export const buildFamilyData = (
  name: string,
  ownerId: string,
  kartuKeluargaUrl?: string
): { name: string; ownerId: string; kartuKeluargaUrl?: string } => {
  return {
    name: name.trim(),
    ownerId,
    ...(kartuKeluargaUrl ? { kartuKeluargaUrl } : {})
  };
};

/**
 * Check if family name is duplicate among user's families
 */
export const isFamilyDuplicate = (families: Family[], name: string, ownerId: string): boolean => {
  return families.some(f => 
    f.name.toLowerCase() === name.trim().toLowerCase() && 
    f.ownerId === ownerId
  );
};

/**
 * Delete all members in a family
 */
export const deleteAllFamilyMembers = async (familyId: string): Promise<void> => {
  const members = await memberService.getMembersByFamily(familyId);
  for (const member of members) {
    await memberService.deleteMember(familyId, member.id);
  }
};

/**
 * Get success/error toast for family operations
 */
export const showFamilyToast = (action: 'create' | 'update' | 'delete', success: boolean): void => {
  if (success) {
    const messages = {
      create: 'Keluarga berhasil dibuat!',
      update: 'Keluarga berhasil diperbarui!',
      delete: 'Keluarga berhasil dihapus.'
    };
    toast.success(messages[action]);
  } else {
    const messages = {
      create: 'Gagal membuat keluarga.',
      update: 'Gagal memperbarui keluarga.',
      delete: 'Gagal menghapus keluarga.'
    };
    toast.error(messages[action]);
  }
};

// =========================================
// MEMBER HELPERS
// =========================================

/**
 * Build member data for create (filters undefined values)
 */
export const buildMemberCreateData = (
  memberData: Partial<Member>,
  familyId: string,
  userId: string
): Omit<Member, 'id'> => {
  const { id, name, gender, birthDate, fatherId, motherId, spouseId, maritalStatus, marriageDate, bio, photoUrl } = memberData;
  
  return {
    name: name || '',
    gender: gender || 'other',
    familyId,
    birthDate,
    fatherId,
    motherId,
    spouseId,
    maritalStatus,
    ...(marriageDate ? { marriageDate } : {}),
    bio,
    photoUrl,
    createdBy: userId,
    updatedAt: new Date().toISOString()
  };
};

/**
 * Build member data for update (filters undefined values)
 */
export const buildMemberUpdateData = (memberData: Partial<Member>): Partial<Member> => {
  return {
    ...memberData,
    updatedAt: new Date().toISOString()
  };
};

/**
 * Get success/error toast for member operations
 */
export const showMemberToast = (action: 'create' | 'update' | 'delete', success: boolean): void => {
  if (success) {
    const messages = {
      create: 'Anggota baru ditambahkan!',
      update: 'Data anggota diperbarui!',
      delete: 'Anggota berhasil dihapus.'
    };
    toast.success(messages[action]);
  } else {
    const messages = {
      create: 'Gagal menyimpan data anggota.',
      update: 'Gagal menyimpan data anggota.',
      delete: 'Gagal menghapus anggota.'
    };
    toast.error(messages[action]);
  }
};

/**
 * Build quick add relative data
 */
export const buildQuickAddRelative = (
  member: Member,
  familyId?: string
): Partial<Member> => {
  const newMember: Partial<Member> = { familyId };

  if (member.gender === 'male') {
    newMember.fatherId = member.id;
    if (member.spouseId) {
      newMember.motherId = member.spouseId;
    }
  } else if (member.gender === 'female') {
    newMember.motherId = member.id;
    if (member.spouseId) {
      newMember.fatherId = member.spouseId;
    }
  }

  return newMember;
};

// =========================================
// DUPLICATE CHECK HELPERS
// =========================================

/**
 * Find duplicate family names
 */
export const findDuplicateFamilies = (families: Family[], ownerId: string): string[] => {
  const ownedFamilies = families.filter(f => f.ownerId === ownerId);
  const familyNames = new Set<string>();
  const duplicates: string[] = [];

  ownedFamilies.forEach(f => {
    const name = f.name.toLowerCase().trim();
    if (familyNames.has(name)) {
      duplicates.push(f.name);
    }
    familyNames.add(name);
  });

  return duplicates;
};

/**
 * Find duplicate members in a family
 */
export const findDuplicateMembers = (members: Member[]): string[] => {
  const memberKeys = new Set<string>();
  const duplicates: string[] = [];

  members.forEach(m => {
    const key = `${m.name.toLowerCase().trim()}|${m.birthDate || ''}`;
    if (memberKeys.has(key)) {
      duplicates.push(m.name);
    }
    memberKeys.add(key);
  });

  return duplicates;
};

/**
 * Enhanced duplicate detection - checks multiple criteria
 */
export const findExactDuplicates = (members: Member[]): Member[][] => {
  const groups = new Map<string, Member[]>();
  
  members.forEach(m => {
    // Key: name + birthDate (exact match)
    const key = `${m.name.toLowerCase().trim()}|${m.birthDate || ''}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(m);
  });
  
  // Return only groups with more than one member
  return Array.from(groups.values()).filter(group => group.length > 1);
};

/**
 * Find similar members (fuzzy matching based on name similarity)
 */
export const findSimilarMembers = (members: Member[]): Member[][] => {
  const similarGroups: Member[][] = [];
  const processed = new Set<string>();
  
  members.forEach(member => {
    if (processed.has(member.id)) return;
    
    const similar: Member[] = [member];
    const normalizedName = member.name.toLowerCase().trim();
    
    members.forEach(other => {
      if (member.id === other.id) return;
      if (processed.has(other.id)) return;
      
      const otherNormalized = other.name.toLowerCase().trim();
      
      // Check if names are very similar (allowing for typos)
      if (areNamesSimilar(normalizedName, otherNormalized)) {
        similar.push(other);
        processed.add(other.id);
      }
    });
    
    if (similar.length > 1) {
      similarGroups.push(similar);
      processed.add(member.id);
    }
  });
  
  return similarGroups;
};

/**
 * Simple string similarity check (Jaccard-based)
 */
const areNamesSimilar = (name1: string, name2: string): boolean => {
  // Exact match
  if (name1 === name2) return true;
  
  // Check if one contains the other
  if (name1.includes(name2) || name2.includes(name1)) return true;
  
  // Simple word-based similarity
  const words1 = new Set(name1.split(' ').filter(w => w.length > 2));
  const words2 = new Set(name2.split(' ').filter(w => w.length > 2));
  
  if (words1.size === 0 || words2.size === 0) return false;
  
  // Calculate Jaccard similarity
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size > 0.5;
};

/**
 * Show duplicate check results
 */
export const showDuplicateResults = (
  familyDuplicates: string[], 
  memberDuplicates: string[],
  exactDuplicates?: Member[][],
  similarMembers?: Member[][]
): void => {
  if (familyDuplicates.length === 0 && memberDuplicates.length === 0 && (!exactDuplicates || exactDuplicates.length === 0) && (!similarMembers || similarMembers.length === 0)) {
    toast.info('Tidak ditemukan duplikasi keluarga atau anggota.');
    return;
  }

  let message = '';
  if (familyDuplicates.length > 0) {
    message += `Duplikasi keluarga: ${[...new Set(familyDuplicates)].join(', ')}. `;
  }
  if (memberDuplicates.length > 0) {
    message += `Duplikasi anggota di keluarga ini: ${[...new Set(memberDuplicates)].join(', ')}. `;
  }
  
  // Show exact duplicates details
  if (exactDuplicates && exactDuplicates.length > 0) {
    exactDuplicates.forEach(group => {
      const names = group.map(m => m.name).join(' & ');
      message += `\n⚠️ Duplicate: ${names} (same name & birth date)`;
    });
  }
  
  // Show similar members
  if (similarMembers && similarMembers.length > 0) {
    similarMembers.forEach(group => {
      const names = group.map(m => m.name).join(' & ');
      message += `\n🔍 Similar names: ${names}`;
    });
  }
  
  toast.warning(message, { duration: 10000 });
};

export default {
  buildFamilyData,
  isFamilyDuplicate,
  deleteAllFamilyMembers,
  showFamilyToast,
  buildMemberCreateData,
  buildMemberUpdateData,
  showMemberToast,
  buildQuickAddRelative,
  findDuplicateFamilies,
  findDuplicateMembers,
  findExactDuplicates,
  findSimilarMembers,
  showDuplicateResults
};