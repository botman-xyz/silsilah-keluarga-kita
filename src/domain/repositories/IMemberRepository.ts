import { Member } from '../entities';

/**
 * Repository interface for Member data operations
 * This defines the contract that any implementation (Firebase, REST API, etc.) must follow
 */
export interface IMemberRepository {
  /**
   * Get all members for a specific family
   */
  getByFamilyId(familyId: string): Promise<Member[]>;
  
  /**
   * Get a single member by ID
   */
  getById(familyId: string, memberId: string): Promise<Member | null>;
  
  /**
   * Create a new member
   */
  create(familyId: string, member: Omit<Member, 'id'>): Promise<Member>;
  
  /**
   * Update an existing member
   */
  update(familyId: string, memberId: string, data: Partial<Member>): Promise<void>;
  
  /**
   * Delete a member
   */
  delete(familyId: string, memberId: string): Promise<void>;
  
  /**
   * Subscribe to family members changes (real-time updates)
   */
  subscribeByFamilyId(familyId: string, callback: (members: Member[]) => void): () => void;
}
