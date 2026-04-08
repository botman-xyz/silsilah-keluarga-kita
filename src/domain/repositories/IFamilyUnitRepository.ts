/**
 * FamilyUnit Repository Interface
 * 
 * This is a domain abstraction - defines what the domain needs
 * Implementation is in infrastructure layer (Firebase)
 * 
 * FamilyUnit represents a married couple and their children:
 * - husbandId: the male spouse
 * - wifeId: the female spouse
 * - childrenIds: direct children of this couple
 */

import { FamilyUnit } from '../entities';

/**
 * Repository interface for FamilyUnit operations
 * Follows DDD repository pattern - only interface in domain
 */
export interface IFamilyUnitRepository {
  /**
   * Get all FamilyUnits for a family
   */
  getByFamilyId(familyId: string): Promise<FamilyUnit[]>;
  
  /**
   * Get a single FamilyUnit by ID
   */
  getById(familyId: string, unitId: string): Promise<FamilyUnit | null>;
  
  /**
   * Get FamilyUnit containing a specific member
   */
  getByMemberId(familyId: string, memberId: string): Promise<FamilyUnit | null>;
  
  /**
   * Create a new FamilyUnit (when members get married)
   */
  create(familyId: string, unit: Omit<FamilyUnit, 'id' | 'createdAt' | 'updatedAt'>): Promise<FamilyUnit>;
  
  /**
   * Update a FamilyUnit
   */
  update(familyId: string, unitId: string, data: Partial<FamilyUnit>): Promise<void>;
  
  /**
   * Delete a FamilyUnit (e.g., on divorce)
   */
  delete(familyId: string, unitId: string): Promise<void>;
  
  /**
   * Add a child to FamilyUnit
   */
  addChild(familyId: string, unitId: string, childId: string): Promise<void>;
  
  /**
   * Remove a child from FamilyUnit
   */
  removeChild(familyId: string, unitId: string, childId: string): Promise<void>;
  
  /**
   * Subscribe to FamilyUnit changes
   */
  subscribeByFamilyId(familyId: string, callback: (units: FamilyUnit[]) => void): () => void;
}
