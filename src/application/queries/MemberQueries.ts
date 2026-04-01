/**
 * Member Queries
 * Query objects for read operations in CQRS pattern
 */

/**
 * Query to get a single member
 */
export interface GetMemberQuery {
  familyId: string;
  memberId: string;
}

/**
 * Query to get all members in a family
 */
export interface GetFamilyMembersQuery {
  familyId: string;
}

/**
 * Query to get members with filters
 */
export interface GetMembersWithFiltersQuery {
  familyId: string;
  filters?: {
    gender?: 'male' | 'female' | 'other';
    hasParents?: boolean;
    hasSpouse?: boolean;
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
    minAge?: number;
    maxAge?: number;
  };
}

/**
 * Query to search members by name
 */
export interface SearchMembersQuery {
  familyId: string;
  searchTerm: string;
}

/**
 * Query to get family statistics
 */
export interface GetFamilyStatsQuery {
  familyId: string;
}

/**
 * Query to get member relationships
 */
export interface GetMemberRelationshipsQuery {
  familyId: string;
  memberId: string;
}

/**
 * Query to get family tree data
 */
export interface GetFamilyTreeQuery {
  familyId: string;
  rootMemberId?: string;
  maxDepth?: number;
}
