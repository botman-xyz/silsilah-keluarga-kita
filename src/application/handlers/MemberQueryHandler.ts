/**
 * Member Query Handler
 * Handles read operations in CQRS pattern
 */

import { Member } from '../../domain/entities';
import { IMemberRepository } from '../../domain/repositories/IMemberRepository';
import { IMemberReadModelRepository, MemberReadModel, FamilyStatsReadModel } from '../../domain/repositories/IMemberReadModelRepository';
import {
  GetMemberQuery,
  GetFamilyMembersQuery,
  GetMembersWithFiltersQuery,
  SearchMembersQuery,
  GetFamilyStatsQuery,
  GetMemberRelationshipsQuery,
  GetFamilyTreeQuery
} from '../queries/MemberQueries';

export class MemberQueryHandler {
  constructor(
    private memberRepository: IMemberRepository,
    private readModelRepository: IMemberReadModelRepository
  ) {}

  /**
   * Handle get member query
   */
  async handleGetMember(query: GetMemberQuery): Promise<MemberReadModel | null> {
    // Try read model first (optimized for queries)
    const readModel = await this.readModelRepository.getById(
      query.familyId,
      query.memberId
    );

    if (readModel) {
      return readModel;
    }

    // Fallback to domain model and project to read model
    const member = await this.memberRepository.getById(
      query.familyId,
      query.memberId
    );

    if (!member) {
      return null;
    }

    // Project to read model
    const readModelData = this.projectToReadModel(member);
    
    // Cache the read model for future queries
    await this.readModelRepository.upsert(query.familyId, readModelData);

    return readModelData;
  }

  /**
   * Handle get family members query
   */
  async handleGetFamilyMembers(query: GetFamilyMembersQuery): Promise<MemberReadModel[]> {
    // Try read model first
    const readModels = await this.readModelRepository.getByFamilyId(query.familyId);

    if (readModels.length > 0) {
      return readModels;
    }

    // Fallback to domain model and project to read models
    const members = await this.memberRepository.getByFamilyId(query.familyId);
    const readModelsData = members.map(member => this.projectToReadModel(member));

    // Cache the read models for future queries
    for (const readModel of readModelsData) {
      await this.readModelRepository.upsert(query.familyId, readModel);
    }

    return readModelsData;
  }

  /**
   * Handle get members with filters query
   */
  async handleGetMembersWithFilters(query: GetMembersWithFiltersQuery): Promise<MemberReadModel[]> {
    // Use read model repository for filtered queries
    return this.readModelRepository.getWithFilters(query.familyId, query.filters);
  }

  /**
   * Handle search members query
   */
  async handleSearchMembers(query: SearchMembersQuery): Promise<MemberReadModel[]> {
    // Use read model repository for search
    return this.readModelRepository.search(query.familyId, query.searchTerm);
  }

  /**
   * Handle get family stats query
   */
  async handleGetFamilyStats(query: GetFamilyStatsQuery): Promise<FamilyStatsReadModel> {
    // Use read model repository for stats
    return this.readModelRepository.getFamilyStats(query.familyId);
  }

  /**
   * Handle get member relationships query
   */
  async handleGetMemberRelationships(query: GetMemberRelationshipsQuery): Promise<{
    parents: MemberReadModel[];
    children: MemberReadModel[];
    spouse: MemberReadModel | null;
    siblings: MemberReadModel[];
  }> {
    const member = await this.handleGetMember({
      familyId: query.familyId,
      memberId: query.memberId
    });

    if (!member) {
      throw new Error(`Member not found: ${query.memberId}`);
    }

    const allMembers = await this.handleGetFamilyMembers({
      familyId: query.familyId
    });

    // Find parents
    const parents: MemberReadModel[] = [];
    if (member.fatherId) {
      const father = allMembers.find(m => m.id === member.fatherId);
      if (father) parents.push(father);
    }
    if (member.motherId) {
      const mother = allMembers.find(m => m.id === member.motherId);
      if (mother) parents.push(mother);
    }

    // Find children
    const children = allMembers.filter(
      m => m.fatherId === member.id || m.motherId === member.id
    );

    // Find spouse
    const spouse = member.spouseId
      ? allMembers.find(m => m.id === member.spouseId) || null
      : null;

    // Find siblings
    const siblings = allMembers.filter(
      m =>
        m.id !== member.id &&
        ((m.fatherId && m.fatherId === member.fatherId) ||
          (m.motherId && m.motherId === member.motherId))
    );

    return { parents, children, spouse, siblings };
  }

  /**
   * Handle get family tree query
   */
  async handleGetFamilyTree(query: GetFamilyTreeQuery): Promise<MemberReadModel[]> {
    const allMembers = await this.handleGetFamilyMembers({
      familyId: query.familyId
    });

    if (query.rootMemberId) {
      // Start from specific member
      const rootMember = allMembers.find(m => m.id === query.rootMemberId);
      if (!rootMember) {
        throw new Error(`Root member not found: ${query.rootMemberId}`);
      }

      // Build tree from root member
      return this.buildTreeFromRoot(rootMember, allMembers, query.maxDepth || 10);
    }

    // Return all members (flat tree)
    return allMembers;
  }

  /**
   * Project domain member to read model
   */
  private projectToReadModel(member: Member): MemberReadModel {
    const birthDate = member.birthDate ? new Date(member.birthDate) : null;
    const deathDate = member.deathDate ? new Date(member.deathDate) : null;
    const now = new Date();

    let age: number | undefined;
    if (birthDate) {
      const endDate = deathDate || now;
      age = Math.floor(
        (endDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
    }

    return {
      id: member.id,
      familyId: member.familyId,
      name: member.name,
      gender: member.gender,
      birthDate: member.birthDate,
      deathDate: member.deathDate,
      age,
      fatherId: member.fatherId,
      motherId: member.motherId,
      spouseId: member.spouseId,
      spouseIds: member.spouseIds,
      maritalStatus: member.maritalStatus,
      marriageDate: member.marriageDate,
      bio: member.bio,
      photoUrl: member.photoUrl,
      createdBy: member.createdBy,
      updatedAt: member.updatedAt,
      hasParents: !!(member.fatherId || member.motherId),
      hasSpouse: !!(member.spouseId || (member.spouseIds && member.spouseIds.length > 0)),
      isAlive: !member.deathDate
    };
  }

  /**
   * Build tree from root member
   */
  private buildTreeFromRoot(
    root: MemberReadModel,
    allMembers: MemberReadModel[],
    maxDepth: number,
    currentDepth: number = 0,
    visited: Set<string> = new Set()
  ): MemberReadModel[] {
    if (currentDepth >= maxDepth || visited.has(root.id)) {
      return [];
    }

    visited.add(root.id);
    const result: MemberReadModel[] = [root];

    // Add children
    const children = allMembers.filter(
      m => m.fatherId === root.id || m.motherId === root.id
    );

    for (const child of children) {
      const childTree = this.buildTreeFromRoot(
        child,
        allMembers,
        maxDepth,
        currentDepth + 1,
        visited
      );
      result.push(...childTree);
    }

    return result;
  }
}
