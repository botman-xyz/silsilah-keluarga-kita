import { Family } from '../entities';

/**
 * Repository interface for Family data operations
 * This defines the contract that any implementation (Firebase, REST API, etc.) must follow
 */
export interface IFamilyRepository {
  /**
   * Get all families owned by a user
   */
  getByOwnerId(userId: string): Promise<Family[]>;
  
  /**
   * Get all families where user is a collaborator
   */
  getByCollaborator(userId: string): Promise<Family[]>;
  
  /**
   * Get a single family by ID
   */
  getById(familyId: string): Promise<Family | null>;
  
  /**
   * Create a new family
   */
  create(family: Omit<Family, 'id'>): Promise<Family>;
  
  /**
   * Update an existing family
   */
  update(familyId: string, data: Partial<Family>): Promise<void>;
  
  /**
   * Delete a family
   */
  delete(familyId: string): Promise<void>;
  
  /**
   * Subscribe to family changes (real-time updates)
   */
  subscribeByOwnerId(userId: string, callback: (families: Family[]) => void): () => void;
  
  /**
   * Subscribe to collaborator family changes
   */
  subscribeByCollaborator(userId: string, callback: (families: Family[]) => void): () => void;
}
