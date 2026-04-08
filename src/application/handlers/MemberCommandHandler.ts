/**
 * Member Command Handler
 * Handles write operations in CQRS pattern
 */

import { Member } from '../../domain/entities';
import { IMemberRepository } from '../../domain/repositories/IMemberRepository';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { DomainEventDispatcher } from '../../domain/events';
import {
  CreateMemberCommand,
  UpdateMemberCommand,
  DeleteMemberCommand,
  SetParentsCommand,
  SetSpouseCommand,
  RemoveSpouseCommand
} from '../commands/MemberCommands';

export class MemberCommandHandler {
  constructor(
    private memberRepository: IMemberRepository,
    private authRepository: IAuthRepository,
    private eventDispatcher: DomainEventDispatcher
  ) {}

  /**
   * Handle create member command
   */
  async handleCreateMember(command: CreateMemberCommand): Promise<Member> {
    // Validate command
    this.validateCreateMemberCommand(command);

    // Get current user ID from auth repository
    const currentUserId = this.authRepository.getCurrentUserId() ?? 'system';

    // Create member data
    const memberData: Omit<Member, 'id'> = {
      familyId: command.familyId,
      name: command.name.trim(),
      gender: command.gender,
      birthDate: command.birthDate,
      deathDate: command.deathDate,
      fatherId: command.fatherId,
      motherId: command.motherId,
      spouseId: command.spouseId,
      maritalStatus: command.maritalStatus || 'single',
      marriageDate: command.marriageDate,
      bio: command.bio,
      photoUrl: command.photoUrl,
      createdBy: currentUserId,
      updatedAt: new Date().toISOString()
    };

    // Create member
    const member = await this.memberRepository.create(command.familyId, memberData);

    // Publish domain event
    await this.eventDispatcher.dispatchMemberEvent({
      eventType: 'MemberCreated',
      aggregateId: member.id,
      occurredAt: new Date(),
      familyId: command.familyId,
      memberName: member.name,
      gender: member.gender
    } as any);

    return member;
  }

  /**
   * Handle update member command
   */
  async handleUpdateMember(command: UpdateMemberCommand): Promise<void> {
    // Validate command
    this.validateUpdateMemberCommand(command);

    // Get existing member
    const existingMember = await this.memberRepository.getById(
      command.familyId,
      command.memberId
    );

    if (!existingMember) {
      throw new Error(`Member not found: ${command.memberId}`);
    }

    // Build update data
    const updateData: Partial<Member> = {};
    if (command.name !== undefined) updateData.name = command.name.trim();
    if (command.gender !== undefined) updateData.gender = command.gender;
    if (command.birthDate !== undefined) updateData.birthDate = command.birthDate;
    if (command.deathDate !== undefined) updateData.deathDate = command.deathDate;
    if (command.fatherId !== undefined) updateData.fatherId = command.fatherId;
    if (command.motherId !== undefined) updateData.motherId = command.motherId;
    if (command.spouseId !== undefined) updateData.spouseId = command.spouseId;
    if (command.maritalStatus !== undefined) updateData.maritalStatus = command.maritalStatus;
    if (command.marriageDate !== undefined) updateData.marriageDate = command.marriageDate;
    if (command.bio !== undefined) updateData.bio = command.bio;
    if (command.photoUrl !== undefined) updateData.photoUrl = command.photoUrl;

    // Update member
    await this.memberRepository.update(command.familyId, command.memberId, updateData);

    // Publish domain event
    await this.eventDispatcher.dispatchMemberEvent({
      eventType: 'MemberUpdated',
      aggregateId: command.memberId,
      occurredAt: new Date(),
      familyId: command.familyId,
      changes: updateData
    } as any);
  }

  /**
   * Handle delete member command
   */
  async handleDeleteMember(command: DeleteMemberCommand): Promise<void> {
    // Validate command
    this.validateDeleteMemberCommand(command);

    // Get existing member
    const existingMember = await this.memberRepository.getById(
      command.familyId,
      command.memberId
    );

    if (!existingMember) {
      throw new Error(`Member not found: ${command.memberId}`);
    }

    // Delete member
    await this.memberRepository.delete(command.familyId, command.memberId);

    // Publish domain event
    await this.eventDispatcher.dispatchMemberEvent({
      eventType: 'MemberDeleted',
      aggregateId: command.memberId,
      occurredAt: new Date(),
      familyId: command.familyId,
      memberName: existingMember.name
    } as any);
  }

  /**
   * Handle set parents command
   */
  async handleSetParents(command: SetParentsCommand): Promise<void> {
    // Validate command
    this.validateSetParentsCommand(command);

    // Get existing member
    const existingMember = await this.memberRepository.getById(
      command.familyId,
      command.memberId
    );

    if (!existingMember) {
      throw new Error(`Member not found: ${command.memberId}`);
    }

    // Build update data
    const updateData: Partial<Member> = {};
    if (command.fatherId !== undefined) updateData.fatherId = command.fatherId;
    if (command.motherId !== undefined) updateData.motherId = command.motherId;

    // Update member
    await this.memberRepository.update(command.familyId, command.memberId, updateData);

    // Publish domain event
    await this.eventDispatcher.dispatchMemberEvent({
      eventType: 'ParentAssigned',
      aggregateId: command.memberId,
      occurredAt: new Date(),
      familyId: command.familyId,
      childId: command.memberId,
      parentId: command.fatherId || command.motherId || '',
      parentType: command.fatherId ? 'father' : 'mother'
    } as any);
  }

  /**
   * Handle set spouse command
   */
  async handleSetSpouse(command: SetSpouseCommand): Promise<void> {
    // Validate command
    this.validateSetSpouseCommand(command);

    // Get existing member
    const existingMember = await this.memberRepository.getById(
      command.familyId,
      command.memberId
    );

    if (!existingMember) {
      throw new Error(`Member not found: ${command.memberId}`);
    }

    // Build update data
    const updateData: Partial<Member> = {
      spouseId: command.spouseId,
      maritalStatus: 'married',
      marriageDate: command.marriageDate
    };

    // Update member
    await this.memberRepository.update(command.familyId, command.memberId, updateData);

    // Publish domain event
    await this.eventDispatcher.dispatchMemberEvent({
      eventType: 'SpouseAssigned',
      aggregateId: command.memberId,
      occurredAt: new Date(),
      familyId: command.familyId,
      spouseId: command.spouseId,
      isPrimary: command.isPrimary ?? true
    } as any);
  }

  /**
   * Handle remove spouse command
   */
  async handleRemoveSpouse(command: RemoveSpouseCommand): Promise<void> {
    // Validate command
    this.validateRemoveSpouseCommand(command);

    // Get existing member
    const existingMember = await this.memberRepository.getById(
      command.familyId,
      command.memberId
    );

    if (!existingMember) {
      throw new Error(`Member not found: ${command.memberId}`);
    }

    // Build update data
    const updateData: Partial<Member> = {
      spouseId: undefined,
      maritalStatus: 'single'
    };

    // Update member
    await this.memberRepository.update(command.familyId, command.memberId, updateData);

    // Publish domain event
    await this.eventDispatcher.dispatchMemberEvent({
      eventType: 'SpouseRemoved',
      aggregateId: command.memberId,
      occurredAt: new Date(),
      familyId: command.familyId,
      spouseId: command.spouseId
    } as any);
  }

  // Validation methods
  private validateCreateMemberCommand(command: CreateMemberCommand): void {
    if (!command.familyId) {
      throw new Error('Family ID is required');
    }
    if (!command.name || command.name.trim().length === 0) {
      throw new Error('Member name is required');
    }
    if (!command.gender) {
      throw new Error('Gender is required');
    }
  }

  private validateUpdateMemberCommand(command: UpdateMemberCommand): void {
    if (!command.familyId) {
      throw new Error('Family ID is required');
    }
    if (!command.memberId) {
      throw new Error('Member ID is required');
    }
  }

  private validateDeleteMemberCommand(command: DeleteMemberCommand): void {
    if (!command.familyId) {
      throw new Error('Family ID is required');
    }
    if (!command.memberId) {
      throw new Error('Member ID is required');
    }
  }

  private validateSetParentsCommand(command: SetParentsCommand): void {
    if (!command.familyId) {
      throw new Error('Family ID is required');
    }
    if (!command.memberId) {
      throw new Error('Member ID is required');
    }
  }

  private validateSetSpouseCommand(command: SetSpouseCommand): void {
    if (!command.familyId) {
      throw new Error('Family ID is required');
    }
    if (!command.memberId) {
      throw new Error('Member ID is required');
    }
    if (!command.spouseId) {
      throw new Error('Spouse ID is required');
    }
  }

  private validateRemoveSpouseCommand(command: RemoveSpouseCommand): void {
    if (!command.familyId) {
      throw new Error('Family ID is required');
    }
    if (!command.memberId) {
      throw new Error('Member ID is required');
    }
    if (!command.spouseId) {
      throw new Error('Spouse ID is required');
    }
  }
}
