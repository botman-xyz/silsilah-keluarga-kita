/**
 * Member Commands
 * Command objects for write operations in CQRS pattern
 */

/**
 * Command to create a new member
 */
export interface CreateMemberCommand {
  familyId: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: string;
  deathDate?: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  marriageDate?: string;
  bio?: string;
  photoUrl?: string;
}

/**
 * Command to update an existing member
 */
export interface UpdateMemberCommand {
  familyId: string;
  memberId: string;
  name?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  deathDate?: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  marriageDate?: string;
  bio?: string;
  photoUrl?: string;
}

/**
 * Command to delete a member
 */
export interface DeleteMemberCommand {
  familyId: string;
  memberId: string;
}

/**
 * Command to set parent relationships
 */
export interface SetParentsCommand {
  familyId: string;
  memberId: string;
  fatherId?: string;
  motherId?: string;
}

/**
 * Command to set spouse relationship
 */
export interface SetSpouseCommand {
  familyId: string;
  memberId: string;
  spouseId: string;
  isPrimary?: boolean;
  marriageDate?: string;
}

/**
 * Command to remove spouse relationship
 */
export interface RemoveSpouseCommand {
  familyId: string;
  memberId: string;
  spouseId: string;
}
