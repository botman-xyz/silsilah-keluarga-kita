/**
 * Member Validation Utilities
 * Validation helpers for member operations
 */

import { Member } from '../../domain/entities';

/**
 * Check if member has required fields for saving
 */
export const isValidMember = (member: Partial<Member>): boolean => {
  return !!(member.name && member.name.trim().length > 0);
};

/**
 * Check if member has spouse
 */
export const hasSpouse = (member: Member): boolean => {
  return !!member.spouseId;
};

/**
 * Check if member is married
 */
export const isMarried = (member: Member): boolean => {
  return member.maritalStatus === 'married';
};

/**
 * Check if member is single
 */
export const isSingle = (member: Member): boolean => {
  return !member.spouseId && member.maritalStatus !== 'married';
};

/**
 * Get member's parents
 */
export const getParents = (
  members: Member[],
  member: Member
): { father?: Member; mother?: Member } => {
  return {
    father: member.fatherId ? members.find(m => m.id === member.fatherId) : undefined,
    mother: member.motherId ? members.find(m => m.id === member.motherId) : undefined
  };
};

/**
 * Get member's children
 */
export const getChildren = (members: Member[], member: Member): Member[] => {
  return members.filter(m => m.fatherId === member.id || m.motherId === member.id);
};

/**
 * Get member's siblings
 */
export const getSiblings = (members: Member[], member: Member): Member[] => {
  if (!member.fatherId && !member.motherId) return [];
  
  return members.filter(m => {
    if (m.id === member.id) return false;
    const sameFather = member.fatherId && m.fatherId === member.fatherId;
    const sameMother = member.motherId && m.motherId === member.motherId;
    return sameFather || sameMother;
  });
};

/**
 * Calculate age from birthDate
 */
export const calculateAge = (birthDate?: string, deathDate?: string): number | null => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const end = deathDate ? new Date(deathDate) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

/**
 * Format age as string
 */
export const formatAge = (birthDate?: string, deathDate?: string): string => {
  const age = calculateAge(birthDate, deathDate);
  if (age === null) return '?';
  if (deathDate) return `${age} th (Alm.)`;
  return `${age} th`;
};

/**
 * Check if member has parents defined
 */
export const hasParents = (member: Member): boolean => {
  return !!(member.fatherId || member.motherId);
};

/**
 * Check if member is a root member (no parents in system)
 */
export const isRootMember = (member: Member, allMembers: Member[]): boolean => {
  const fatherExists = member.fatherId && allMembers.some(m => m.id === member.fatherId);
  const motherExists = member.motherId && allMembers.some(m => m.id === member.motherId);
  return !fatherExists && !motherExists;
};

export default {
  isValidMember,
  hasSpouse,
  isMarried,
  isSingle,
  getParents,
  getChildren,
  getSiblings,
  calculateAge,
  formatAge,
  hasParents,
  isRootMember
};