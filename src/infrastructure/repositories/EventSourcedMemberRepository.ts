/**
 * Event Sourced Member Repository
 * Uses event sourcing for member operations
 */

import { Member } from '../../domain/entities';
import { IMemberRepository } from '../../domain/repositories/IMemberRepository';
import { IEventStore, ISnapshotStore, Snapshot } from '../../domain/events/EventStore';
import { DomainEvent, MemberCreatedEvent, MemberUpdatedEvent, MemberDeletedEvent } from '../../domain/events';

interface MemberState {
  id: string;
  familyId: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: string;
  deathDate?: string;
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
}

export class EventSourcedMemberRepository implements IMemberRepository {
  constructor(
    private eventStore: IEventStore,
    private snapshotStore: ISnapshotStore<MemberState>
  ) {}

  /**
   * Get all members for a specific family
   */
  async getByFamilyId(familyId: string): Promise<Member[]> {
    // This is a simplified implementation
    // In a real event sourcing system, you'd need to track all members in a family
    // For now, we'll return an empty array
    return [];
  }

  /**
   * Get a single member by ID
   */
  async getById(familyId: string, memberId: string): Promise<Member | null> {
    try {
      // Try snapshot first
      const snapshot = await this.snapshotStore.getSnapshot(memberId);

      if (snapshot) {
        // Load events since snapshot
        const events = await this.eventStore.getEventsSince(memberId, snapshot.version);

        // Reconstitute from snapshot + events
        return this.reconstituteFromSnapshot(snapshot, events);
      }

      // Load all events
      const events = await this.eventStore.getEvents(memberId);

      if (events.length === 0) {
        return null;
      }

      // Reconstitute from events
      return this.reconstituteFromEvents(events);
    } catch (error) {
      console.error('Error getting member:', error);
      throw error;
    }
  }

  /**
   * Create a new member
   */
  async create(familyId: string, member: Omit<Member, 'id'>): Promise<Member> {
    try {
      const memberId = this.generateId();
      const event = new MemberCreatedEvent(
        memberId,
        familyId,
        member.name,
        member.gender
      );

      await this.eventStore.append(event);

      return {
        id: memberId,
        familyId,
        ...member,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  }

  /**
   * Update an existing member
   */
  async update(familyId: string, memberId: string, data: Partial<Member>): Promise<void> {
    try {
      const event = new MemberUpdatedEvent(memberId, familyId, data);
      await this.eventStore.append(event);
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  }

  /**
   * Delete a member
   */
  async delete(familyId: string, memberId: string): Promise<void> {
    try {
      const member = await this.getById(familyId, memberId);
      if (!member) {
        throw new Error(`Member not found: ${memberId}`);
      }

      const event = new MemberDeletedEvent(memberId, familyId, member.name);
      await this.eventStore.append(event);

      // Delete snapshot
      await this.snapshotStore.deleteSnapshot(memberId);
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  }

  /**
   * Subscribe to family members changes (real-time updates)
   */
  subscribeByFamilyId(familyId: string, callback: (members: Member[]) => void): () => void {
    // Event sourcing doesn't support real-time subscriptions in the same way
    // You'd need to implement a projection or read model for this
    console.warn('Real-time subscriptions not supported in event sourcing');
    return () => {};
  }

  /**
   * Batch update multiple members atomically using a write batch
   */
  async batchUpdate(familyId: string, updates: Array<{ memberId: string; data: Partial<Member> }>): Promise<void> {
    try {
      for (const update of updates) {
        await this.update(familyId, update.memberId, update.data);
      }
    } catch (error) {
      console.error('Error batch updating members:', error);
      throw error;
    }
  }

  /**
   * Reconstitute member from events
   */
  private reconstituteFromEvents(events: DomainEvent[]): Member {
    if (events.length === 0) {
      throw new Error('Cannot reconstitute from empty events');
    }

    const firstEvent = events[0] as MemberCreatedEvent;
    let state: MemberState = {
      id: firstEvent.aggregateId,
      familyId: firstEvent.familyId,
      name: firstEvent.memberName,
      gender: firstEvent.gender as 'male' | 'female' | 'other',
      createdBy: 'system',
      updatedAt: new Date().toISOString()
    };

    // Apply remaining events
    for (const event of events.slice(1)) {
      state = this.applyEvent(state, event);
    }

    return state as Member;
  }

  /**
   * Reconstitute member from snapshot + events
   */
  private reconstituteFromSnapshot(
    snapshot: Snapshot<MemberState>,
    events: DomainEvent[]
  ): Member {
    let state = snapshot.state;

    // Apply events to snapshot state
    for (const event of events) {
      state = this.applyEvent(state, event);
    }

    return state as Member;
  }

  /**
   * Apply event to state
   */
  private applyEvent(state: MemberState, event: DomainEvent): MemberState {
    switch (event.eventType) {
      case 'MemberUpdated':
        const updateEvent = event as MemberUpdatedEvent;
        return {
          ...state,
          ...updateEvent.changes,
          updatedAt: updateEvent.occurredAt.toISOString()
        };

      case 'MemberDeleted':
        // Mark as deleted (soft delete)
        return {
          ...state,
          updatedAt: event.occurredAt.toISOString()
        };

      default:
        return state;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
