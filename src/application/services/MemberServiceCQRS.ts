import { Member } from '../../domain/entities';
import { IMemberRepository } from '../../domain/repositories';
import { MemberCommandHandler } from '../handlers/MemberCommandHandler';
import { MemberQueryHandler } from '../handlers/MemberQueryHandler';
import {
  CreateMemberCommand,
  UpdateMemberCommand,
  DeleteMemberCommand,
  SetParentsCommand,
  SetSpouseCommand,
  RemoveSpouseCommand
} from '../commands/MemberCommands';
import {
  GetMemberQuery,
  GetFamilyMembersQuery,
  GetMembersWithFiltersQuery,
  SearchMembersQuery,
  GetFamilyStatsQuery,
  GetMemberRelationshipsQuery,
  GetFamilyTreeQuery
} from '../queries/MemberQueries';
import { MemberReadModel, FamilyStatsReadModel } from '../../domain/repositories/IMemberReadModelRepository';

/**
 * CQRS-based service for managing family members
 * Uses command and query handlers for separation of concerns
 */
export class MemberServiceCQRS {
  constructor(
    private commandHandler: MemberCommandHandler,
    private queryHandler: MemberQueryHandler
  ) {}

  // ============================================
  // COMMAND OPERATIONS (Write)
  // ============================================

  /**
   * Create a new member
   */
  async createMember(command: CreateMemberCommand): Promise<Member> {
    return this.commandHandler.handleCreateMember(command);
  }

  /**
   * Update a member
   */
  async updateMember(command: UpdateMemberCommand): Promise<void> {
    return this.commandHandler.handleUpdateMember(command);
  }

  /**
   * Delete a member
   */
  async deleteMember(command: DeleteMemberCommand): Promise<void> {
    return this.commandHandler.handleDeleteMember(command);
  }

  /**
   * Set parent relationships (father/mother)
   */
  async setParents(command: SetParentsCommand): Promise<void> {
    return this.commandHandler.handleSetParents(command);
  }

  /**
   * Set spouse relationship
   */
  async setSpouse(command: SetSpouseCommand): Promise<void> {
    return this.commandHandler.handleSetSpouse(command);
  }

  /**
   * Remove spouse relationship
   */
  async removeSpouse(command: RemoveSpouseCommand): Promise<void> {
    return this.commandHandler.handleRemoveSpouse(command);
  }

  // ============================================
  // QUERY OPERATIONS (Read)
  // ============================================

  /**
   * Get a single member by ID
   */
  async getMember(query: GetMemberQuery): Promise<MemberReadModel | null> {
    return this.queryHandler.handleGetMember(query);
  }

  /**
   * Get all members for a family
   */
  async getMembersByFamily(query: GetFamilyMembersQuery): Promise<MemberReadModel[]> {
    return this.queryHandler.handleGetFamilyMembers(query);
  }

  /**
   * Get members with filters
   */
  async getMembersWithFilters(query: GetMembersWithFiltersQuery): Promise<MemberReadModel[]> {
    return this.queryHandler.handleGetMembersWithFilters(query);
  }

  /**
   * Search members by name
   */
  async searchMembers(query: SearchMembersQuery): Promise<MemberReadModel[]> {
    return this.queryHandler.handleSearchMembers(query);
  }

  /**
   * Get family statistics
   */
  async getFamilyStats(query: GetFamilyStatsQuery): Promise<FamilyStatsReadModel> {
    return this.queryHandler.handleGetFamilyStats(query);
  }

  /**
   * Get member relationships
   */
  async getMemberRelationships(query: GetMemberRelationshipsQuery): Promise<{
    parents: MemberReadModel[];
    children: MemberReadModel[];
    spouse: MemberReadModel | null;
    siblings: MemberReadModel[];
  }> {
    return this.queryHandler.handleGetMemberRelationships(query);
  }

  /**
   * Get family tree data
   */
  async getFamilyTree(query: GetFamilyTreeQuery): Promise<MemberReadModel[]> {
    return this.queryHandler.handleGetFamilyTree(query);
  }

  // ============================================
  // CONVENIENCE METHODS
  // ============================================

  /**
   * Get all members for a family (convenience method)
   */
  async getAllMembers(familyId: string): Promise<MemberReadModel[]> {
    return this.getMembersByFamily({ familyId });
  }

  /**
   * Get a single member (convenience method)
   */
  async getMemberById(familyId: string, memberId: string): Promise<MemberReadModel | null> {
    return this.getMember({ familyId, memberId });
  }

  /**
   * Create a new member (convenience method)
   */
  async createNewMember(
    familyId: string,
    name: string,
    gender: 'male' | 'female' | 'other',
    options?: {
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
  ): Promise<Member> {
    return this.createMember({
      familyId,
      name,
      gender,
      ...options
    });
  }

  /**
   * Update a member (convenience method)
   */
  async updateMemberById(
    familyId: string,
    memberId: string,
    updates: Partial<Omit<UpdateMemberCommand, 'familyId' | 'memberId'>>
  ): Promise<void> {
    return this.updateMember({
      familyId,
      memberId,
      ...updates
    });
  }

  /**
   * Delete a member (convenience method)
   */
  async deleteMemberById(familyId: string, memberId: string): Promise<void> {
    return this.deleteMember({ familyId, memberId });
  }

  /**
   * Set parents for a member (convenience method)
   */
  async setParentsForMember(
    familyId: string,
    memberId: string,
    fatherId?: string,
    motherId?: string
  ): Promise<void> {
    return this.setParents({
      familyId,
      memberId,
      fatherId,
      motherId
    });
  }

  /**
   * Set spouse for a member (convenience method)
   */
  async setSpouseForMember(
    familyId: string,
    memberId: string,
    spouseId: string,
    options?: {
      isPrimary?: boolean;
      marriageDate?: string;
    }
  ): Promise<void> {
    return this.setSpouse({
      familyId,
      memberId,
      spouseId,
      ...options
    });
  }

  /**
   * Remove spouse from a member (convenience method)
   */
  async removeSpouseFromMember(
    familyId: string,
    memberId: string,
    spouseId: string
  ): Promise<void> {
    return this.removeSpouse({
      familyId,
      memberId,
      spouseId
    });
  }

  /**
   * Search members by name (convenience method)
   */
  async searchMembersByName(familyId: string, searchTerm: string): Promise<MemberReadModel[]> {
    return this.searchMembers({ familyId, searchTerm });
  }

  /**
   * Get family statistics (convenience method)
   */
  async getStats(familyId: string): Promise<FamilyStatsReadModel> {
    return this.getFamilyStats({ familyId });
  }

  /**
   * Get member relationships (convenience method)
   */
  async getRelationships(familyId: string, memberId: string): Promise<{
    parents: MemberReadModel[];
    children: MemberReadModel[];
    spouse: MemberReadModel | null;
    siblings: MemberReadModel[];
  }> {
    return this.getMemberRelationships({ familyId, memberId });
  }

  /**
   * Get family tree (convenience method)
   */
  async getTree(familyId: string, rootMemberId?: string, maxDepth?: number): Promise<MemberReadModel[]> {
    return this.getFamilyTree({
      familyId,
      rootMemberId,
      maxDepth
    });
  }
}
