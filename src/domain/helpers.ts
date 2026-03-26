/**
 * Domain Helper Functions
 * Pure business logic with no external dependencies
 */

import { Member } from './entities';

// =========================================
// 👥 MEMBER UTILITIES
// =========================================

/**
 * Check if a member is duplicate based on name and birthDate
 */
export const isDuplicateMember = (
  members: Member[], 
  newName: string, 
  newBirthDate?: string, 
  excludeId?: string
): boolean => {
  return members.some(m => 
    m.id !== excludeId &&
    m.name.toLowerCase() === newName.trim().toLowerCase() &&
    m.birthDate === newBirthDate
  );
};

/**
 * Generate unique key for member (for deduplication)
 */
export const getMemberKey = (member: Member): string => {
  return `${member.name.toLowerCase().trim()}|${member.birthDate || ''}`;
};

/**
 * Check if member is editable by current user
 */
export const canEditMember = (member: Member, userId?: string, ownerId?: string): boolean => {
  return member.createdBy === userId || ownerId === userId;
};

// =========================================
// 📅 DATE UTILITIES
// =========================================

/**
 * Calculate age from birthDate and optional deathDate
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
 * Format date to Indonesian locale
 */
export const formatDate = (dateString?: string, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return '';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('id-ID', options || defaultOptions);
};

/**
 * Format date short (day + month only)
 */
export const formatDateShort = (dateString?: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
};

// =========================================
// 🔗 RELATIONSHIP UTILITIES
// =========================================

/**
 * Validates if a relationship type is valid
 */
export const isValidRelationship = (relationship: string): boolean => {
  const validRelationships = [
    'parent', 'child', 'spouse', 'sibling',
    'grandparent', 'grandchild', 'uncle', 'aunt',
    'nephew', 'niece', 'cousin'
  ];
  return validRelationships.includes(relationship.toLowerCase());
};

/**
 * Gets the inverse relationship type
 */
export const getInverseRelationship = (relationship: string): string => {
  const inverses: Record<string, string> = {
    parent: 'child',
    child: 'parent',
    spouse: 'spouse',
    sibling: 'sibling',
    grandparent: 'grandchild',
    grandchild: 'grandparent',
    uncle: 'nephew',
    aunt: 'niece',
    nephew: 'uncle',
    niece: 'aunt',
    cousin: 'cousin'
  };
  return inverses[relationship.toLowerCase()] || relationship;
};

/**
 * Validates name format
 */
export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100;
};

/**
 * Calculates generation difference between two family members
 */
export const calculateGenerationDiff = (
  memberGeneration: number,
  relativeGeneration: number
): number => {
  return relativeGeneration - memberGeneration;
};

/**
 * Determines the relationship label between two members
 */
export const getRelationshipLabel = (relationship: string): string => {
  const labels: Record<string, string> = {
    parent: 'Orang Tua',
    child: 'Anak',
    spouse: 'Pasangan',
    sibling: 'Saudara',
    grandparent: 'Kakek/Nenek',
    grandchild: 'Cucu',
    uncle: 'Paman',
    aunt: 'Bibi',
    nephew: 'Keponakan (Laki)',
    niece: 'Keponakan (Perempuan)',
    cousin: 'Sepupu'
  };
  return labels[relationship] || relationship;
};

/**
 * Checks if relationship is direct family (parent/child/spouse)
 */
export const isDirectFamily = (relationship: string): boolean => {
  return ['parent', 'child', 'spouse'].includes(relationship.toLowerCase());
};

/**
 * Filters members by spouse ID
 */
export const findSpouse = (members: Member[], spouseId: string): Member | undefined => {
  return members.find(m => m.id === spouseId);
};

/**
 * Finds parents of a member
 */
export const findParents = (members: Member[], member: Member): { father?: Member; mother?: Member } => {
  return {
    father: member.fatherId ? members.find(m => m.id === member.fatherId) : undefined,
    mother: member.motherId ? members.find(m => m.id === member.motherId) : undefined
  };
};

export default { 
  isDuplicateMember,
  getMemberKey,
  canEditMember,
  calculateAge,
  formatDate,
  formatDateShort,
  isValidRelationship, 
  getInverseRelationship, 
  isValidName, 
  calculateGenerationDiff,
  getRelationshipLabel,
  isDirectFamily,
  findSpouse,
  findParents
};