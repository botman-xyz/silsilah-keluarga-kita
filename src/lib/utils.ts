import { auth } from '../firebase';
import { Member } from '../domain/entities';

// Re-export from firebase.ts (DRY - single source of truth)
export { OperationType } from '../firebase';
export type { FirestoreErrorInfo } from '../firebase';
export { handleFirestoreError } from '../firebase';

// =========================================
// 📅 DATE UTILITIES (DRY)
// =========================================

/**
 * Calculate age from birthDate and optional deathDate
 * Used in: FamilyStats, MemberList, MemberDetailView, ExportService
 */
export function calculateAge(birthDate?: string, deathDate?: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const end = deathDate ? new Date(deathDate) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Format date to Indonesian locale
 * Used in: FamilyStats, MemberList, MemberDetailView, SearchModal, FamilyTimeline
 */
export function formatDate(dateString?: string, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return '';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('id-ID', options || defaultOptions);
}

/**
 * Format date short (day + month only)
 */
export function formatDateShort(dateString?: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
}

// =========================================
// 👥 MEMBER UTILITIES (DRY)
// =========================================

/**
 * Check if a member is duplicate based on name and birthDate
 * Used in: App.tsx handleSaveMember
 */
export function isDuplicateMember(members: Member[], newName: string, newBirthDate?: string, excludeId?: string): boolean {
  return members.some(m => 
    m.id !== excludeId &&
    m.name.toLowerCase() === newName.trim().toLowerCase() &&
    m.birthDate === newBirthDate
  );
}

/**
 * Generate unique key for member (for deduplication)
 */
export function getMemberKey(member: Member): string {
  return `${member.name.toLowerCase().trim()}|${member.birthDate || ''}`;
}

/**
 * Check if member is editable by current user
 */
export function canEditMember(member: Member, userId?: string, ownerId?: string): boolean {
  return member.createdBy === userId || ownerId === userId;
}

// =========================================
// 🧪 ERROR HANDLING (re-exported from firebase.ts)
// =========================================

// All error handling utilities are re-exported from firebase.ts above
