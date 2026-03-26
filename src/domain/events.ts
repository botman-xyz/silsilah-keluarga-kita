/**
 * DDD Domain Events System
 * Provides event-driven communication between bounded contexts
 */

// =========================================
//的事件基类 (EVENT BASE)
// =========================================

/**
 * Base interface for all domain events
 */
export interface DomainEvent {
  readonly eventType: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;
}

/**
 * Abstract base class for domain events
 */
export abstract class Event implements DomainEvent {
  public readonly eventType: string;
  public readonly occurredAt: Date;
  public readonly aggregateId: string;

  constructor(aggregateId: string, eventType: string) {
    this.aggregateId = aggregateId;
    this.eventType = eventType;
    this.occurredAt = new Date();
  }
}

// =========================================
// 👨‍👩‍👧‍👦 FAMILY DOMAIN EVENTS
// =========================================

export class FamilyCreatedEvent extends Event {
  constructor(
    aggregateId: string,
    public readonly familyName: string,
    public readonly ownerId: string
  ) {
    super(aggregateId, 'FamilyCreated');
  }
}

export class FamilyUpdatedEvent extends Event {
  constructor(
    aggregateId: string,
    public readonly changes: Record<string, unknown>
  ) {
    super(aggregateId, 'FamilyUpdated');
  }
}

export class FamilyDeletedEvent extends Event {
  constructor(
    aggregateId: string,
    public readonly ownerId: string,
    public readonly memberCount: number
  ) {
    super(aggregateId, 'FamilyDeleted');
  }
}

export class CollaboratorAddedEvent extends Event {
  constructor(
    aggregateId: string,
    public readonly collaboratorId: string,
    public readonly addedBy: string
  ) {
    super(aggregateId, 'CollaboratorAdded');
  }
}

export class CollaboratorRemovedEvent extends Event {
  constructor(
    aggregateId: string,
    public readonly collaboratorId: string,
    public readonly removedBy: string
  ) {
    super(aggregateId, 'CollaboratorRemoved');
  }
}

// =========================================
// 👤 MEMBER DOMAIN EVENTS
// =========================================

export class MemberCreatedEvent extends Event {
  constructor(
    aggregateId: string,
    public readonly familyId: string,
    public readonly memberName: string,
    public readonly gender: string
  ) {
    super(aggregateId, 'MemberCreated');
  }
}

export class MemberUpdatedEvent extends Event {
  constructor(
    aggregateId: string,
    public readonly familyId: string,
    public readonly changes: Record<string, unknown>
  ) {
    super(aggregateId, 'MemberUpdated');
  }
}

export class MemberDeletedEvent extends Event {
  constructor(
    aggregateId: string,
    public readonly familyId: string,
    public readonly memberName: string
  ) {
    super(aggregateId, 'MemberDeleted');
  }
}

// Relationship Events
export class ParentAssignedEvent extends Event {
  constructor(
    aggregateId: string,
    public readonly childId: string,
    public readonly parentId: string,
    public readonly parentType: 'father' | 'mother'
  ) {
    super(aggregateId, 'ParentAssigned');
  }
}

export class SpouseAssignedEvent extends Event {
  constructor(
    aggregateId: string,
    public readonly spouseId: string,
    public readonly isPrimary: boolean
  ) {
    super(aggregateId, 'SpouseAssigned');
  }
}

export class SpouseRemovedEvent extends Event {
  constructor(
    aggregateId: string,
    public readonly spouseId: string
  ) {
    super(aggregateId, 'SpouseRemoved');
  }
}

// =========================================
// 📊 EVENT HANDLER SYSTEM
// =========================================

/**
 * Event handler type
 */
type EventHandler<T extends DomainEvent> = (event: T) => void | Promise<void>;

/**
 * Event handler registration
 */
interface EventHandlerRegistration {
  handler: EventHandler<DomainEvent>;
  priority: number;
}

/**
 * Simple event bus implementation
 * Handles event publication and subscription
 */
export class EventBus {
  private handlers: Map<string, EventHandlerRegistration[]> = new Map();
  private static instance: EventBus | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to an event type
   */
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
    priority: number = 0
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    this.handlers.get(eventType)!.push({ 
      handler: handler as EventHandler<DomainEvent>, 
      priority 
    });

    // Sort by priority (higher first)
    this.handlers.get(eventType)!.sort((a, b) => b.priority - a.priority);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        const index = handlers.findIndex(h => h.handler === handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Publish an event to all subscribers
   */
  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];
    
    for (const registration of handlers) {
      try {
        await registration.handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.eventType}:`, error);
      }
    }

    // Also publish to wildcard subscribers
    const wildcardHandlers = this.handlers.get('*') || [];
    for (const registration of wildcardHandlers) {
      try {
        await registration.handler(event);
      } catch (error) {
        console.error(`Error in wildcard event handler:`, error);
      }
    }
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clear(): void {
    this.handlers.clear();
  }
}

// =========================================
// 🎯 DOMAIN EVENT DISPATCHER
// =========================================

/**
 * Domain Event Dispatcher
 * Central point for dispatching events from domain services
 */
export class DomainEventDispatcher {
  private eventBus: EventBus;

  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus || EventBus.getInstance();
  }

  /**
   * Dispatch a family event
   */
  dispatchFamilyEvent(event: FamilyCreatedEvent | FamilyUpdatedEvent | FamilyDeletedEvent): Promise<void> {
    return this.eventBus.publish(event);
  }

  /**
   * Dispatch a collaborator event
   */
  dispatchCollaboratorEvent(event: CollaboratorAddedEvent | CollaboratorRemovedEvent): Promise<void> {
    return this.eventBus.publish(event);
  }

  /**
   * Dispatch a member event
   */
  dispatchMemberEvent(event: MemberCreatedEvent | MemberUpdatedEvent | MemberDeletedEvent): Promise<void> {
    return this.eventBus.publish(event);
  }

  /**
   * Dispatch a relationship event
   */
  dispatchRelationshipEvent(
    event: ParentAssignedEvent | SpouseAssignedEvent | SpouseRemovedEvent
  ): Promise<void> {
    return this.eventBus.publish(event);
  }
}

// Singleton instance for convenience
export const eventDispatcher = new DomainEventDispatcher();