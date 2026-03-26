/**
 * Infrastructure Utilities
 * Re-exports from Domain layer + Firebase-specific utilities
 */

// Re-export from Domain layer
export { 
  calculateAge, 
  formatDate, 
  formatDateShort,
  isDuplicateMember,
  getMemberKey,
  canEditMember,
  isValidRelationship,
  getInverseRelationship,
  isValidName,
  calculateGenerationDiff,
  getRelationshipLabel,
  isDirectFamily,
  findSpouse,
  findParents
} from '../domain/helpers';

// Re-export error handling from firebase.ts
export { OperationType } from '../firebase';
export type { FirestoreErrorInfo } from '../firebase';
export { handleFirestoreError } from '../firebase';
