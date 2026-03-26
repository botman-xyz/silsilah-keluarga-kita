import { auth } from '../firebase';
import { Member } from '../domain/entities';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

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
// 🧪 ERROR HANDLING
// =========================================

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
