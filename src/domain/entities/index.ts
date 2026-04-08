export interface UserProfile {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  role: 'user' | 'admin';
}

export interface Family {
  id: string;
  name: string;
  ownerId: string;
  collaborators: string[];
  createdAt: string;
  kartuKeluargaUrl?: string;
}

/**
 * FamilyUnit - represents a married couple and their children
 * This is the "bridge" between two members and their descendants
 * 
 * Key concepts:
 * - familyId: the primary family this unit belongs to
 * - husbandId/wifeId: the couple in this unit
 * - childrenIds: direct children of this couple
 * 
 * This enables:
 * - Clear distinction between birth family and married family
 * - Proper tree visualization with couple nodes
 * - Multi-marriage support (multiple FamilyUnits per person)
 */
export interface FamilyUnit {
  id: string;
  familyId: string;
  husbandId?: string;    // Male spouse
  wifeId?: string;       // Female spouse
  childrenIds: string[]; // Direct children of this couple
  marriageDate?: string;
  divorceDate?: string;
  status: 'active' | 'divorced' | 'annulled';
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  familyId: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: string;
  deathDate?: string;
  photoUrl?: string;
  fatherId?: string;
  motherId?: string;
  // Relationship type to parents
  isAdoptedChild?: boolean;
  spouseId?: string;
  spouseIds?: string[];
  externalSpouseName?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  marriageDate?: string;
  externalFamilyId?: string;
  bio?: string;
  createdBy: string;
  updatedAt: string;
  media?: { url: string; type: 'image' | 'document'; name: string }[];
  
  // Family Unit references (new for DDD)
  birthFamilyUnitId?: string;    // The FamilyUnit they were born into
  currentFamilyUnitId?: string;  // The FamilyUnit (marriage) they're currently in
}

export interface TreeData {
  id: string;
  name: string;
  gender: string;
  photoUrl?: string;
  children?: TreeData[];
  spouse?: TreeData;
}

// Type exports for convenience
export type { UserProfile as IUserProfile, Family as IFamily, Member as IMember, FamilyUnit as IFamilyUnit };
