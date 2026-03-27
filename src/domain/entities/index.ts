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
export type { UserProfile as IUserProfile, Family as IFamily, Member as IMember };
