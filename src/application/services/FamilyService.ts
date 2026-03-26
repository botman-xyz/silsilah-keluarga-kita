import { Family } from '../../domain/entities';
import { IFamilyRepository } from '../../domain/repositories';

/**
 * Use case for managing families
 */
export class FamilyService {
  constructor(private familyRepository: IFamilyRepository) {}

  /**
   * Get all families accessible to a user (owned + collaborator)
   */
  async getAllAccessibleFamilies(userId: string): Promise<Family[]> {
    const ownedFamilies = await this.familyRepository.getByOwnerId(userId);
    const collaboratorFamilies = await this.familyRepository.getByCollaborator(userId);
    
    // Deduplicate by ID
    const combined = [...ownedFamilies, ...collaboratorFamilies];
    return Array.from(new Map(combined.map(f => [f.id, f])).values());
  }

  /**
   * Subscribe to all families accessible to a user
   */
  subscribeToAllAccessibleFamilies(
    userId: string,
    callback: (families: Family[]) => void
  ): () => void {
    const familiesMap = new Map<string, Family>();
    let ownerFamilies: Family[] = [];
    let collabFamilies: Family[] = [];
    
    const unsubOwner = this.familyRepository.subscribeByOwnerId(userId, (families) => {
      ownerFamilies = families;
      this.mergeAndNotify(familiesMap, ownerFamilies, collabFamilies, callback);
    });
    
    const unsubCollab = this.familyRepository.subscribeByCollaborator(userId, (families) => {
      collabFamilies = families;
      this.mergeAndNotify(familiesMap, ownerFamilies, collabFamilies, callback);
    });
    
    return () => {
      unsubOwner();
      unsubCollab();
    };
  }

  private mergeAndNotify(
    familiesMap: Map<string, Family>,
    ownerFamilies: Family[],
    collabFamilies: Family[],
    callback: (families: Family[]) => void
  ): void {
    familiesMap.clear();
    [...ownerFamilies, ...collabFamilies].forEach(f => familiesMap.set(f.id, f));
    callback(Array.from(familiesMap.values()));
  }

  /**
   * Create a new family
   */
  async createFamily(data: { name: string; ownerId: string }): Promise<Family> {
    return this.familyRepository.create({
      name: data.name,
      ownerId: data.ownerId,
      collaborators: [],
      createdAt: new Date().toISOString()
    });
  }

  /**
   * Update family details
   */
  async updateFamily(familyId: string, data: Partial<Family>): Promise<void> {
    return this.familyRepository.update(familyId, data);
  }

  /**
   * Delete a family
   */
  async deleteFamily(familyId: string): Promise<void> {
    return this.familyRepository.delete(familyId);
  }

  /**
   * Add a collaborator to a family
   */
  async addCollaborator(familyId: string, userId: string): Promise<void> {
    // Get current family to get existing collaborators
    const family = await this.familyRepository.getById(familyId);
    if (!family) {
      throw new Error('Keluarga tidak ditemukan');
    }
    
    if (family.collaborators.includes(userId)) {
      return; // Already a collaborator
    }
    
    return this.familyRepository.update(familyId, {
      collaborators: [...family.collaborators, userId]
    });
  }

  /**
   * Remove a collaborator from a family
   */
  async removeCollaborator(familyId: string, userId: string): Promise<void> {
    const family = await this.familyRepository.getById(familyId);
    if (!family) {
      throw new Error('Keluarga tidak ditemukan');
    }
    
    return this.familyRepository.update(familyId, {
      collaborators: family.collaborators.filter(id => id !== userId)
    });
  }
}
