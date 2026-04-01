/**
 * Member Read Model
 * Optimized data structure for read operations in CQRS pattern
 */
export interface MemberReadModel {
  id: string;
  familyId: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: string;
  deathDate?: string;
  age?: number;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  spouseIds?: string[];
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  marriageDate?: string;
  bio?: string;
  photoUrl?: string;
  createdBy: string;
  updatedAt: string;
  // Computed fields
  hasParents: boolean;
  hasSpouse: boolean;
  isAlive: boolean;
  generation?: number;
}

/**
 * Family Statistics Read Model
 */
export interface FamilyStatsReadModel {
  familyId: string;
  totalMembers: number;
  maleCount: number;
  femaleCount: number;
  otherGenderCount: number;
  marriedCount: number;
  singleCount: number;
  divorcedCount: number;
  widowedCount: number;
  averageAge?: number;
  oldestMemberAge?: number;
  youngestMemberAge?: number;
  membersWithParents: number;
  membersWithSpouse: number;
}

/**
 * Repository interface for Member Read Model
 * Optimized for read operations in CQRS pattern
 */
export interface IMemberReadModelRepository {
  /**
   * Get a single member by ID
   */
  getById(familyId: string, memberId: string): Promise<MemberReadModel | null>;

  /**
   * Get all members in a family
   */
  getByFamilyId(familyId: string): Promise<MemberReadModel[]>;

  /**
   * Get members with filters
   */
  getWithFilters(
    familyId: string,
    filters?: {
      gender?: 'male' | 'female' | 'other';
      hasParents?: boolean;
      hasSpouse?: boolean;
      maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
      minAge?: number;
      maxAge?: number;
    }
  ): Promise<MemberReadModel[]>;

  /**
   * Search members by name
   */
  search(familyId: string, searchTerm: string): Promise<MemberReadModel[]>;

  /**
   * Get family statistics
   */
  getFamilyStats(familyId: string): Promise<FamilyStatsReadModel>;

  /**
   * Upsert a member read model
   */
  upsert(familyId: string, member: MemberReadModel): Promise<void>;

  /**
   * Delete a member read model
   */
  delete(familyId: string, memberId: string): Promise<void>;

  /**
   * Delete all read models for a family
   */
  deleteByFamilyId(familyId: string): Promise<void>;
}
