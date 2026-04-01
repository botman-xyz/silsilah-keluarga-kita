/**
 * Event Store Interface
 * Stores all domain events for event sourcing
 */

import { DomainEvent } from '../events';

/**
 * Stored event with metadata
 */
export interface StoredEvent {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventData: string; // JSON serialized event data
  version: number;
  occurredAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Event store interface
 */
export interface IEventStore {
  /**
   * Append an event to the store
   */
  append(event: DomainEvent, metadata?: Record<string, unknown>): Promise<void>;

  /**
   * Get all events for an aggregate
   */
  getEvents(aggregateId: string): Promise<StoredEvent[]>;

  /**
   * Get events for an aggregate since a specific version
   */
  getEventsSince(aggregateId: string, version: number): Promise<StoredEvent[]>;

  /**
   * Get all events of a specific type
   */
  getEventsByType(eventType: string): Promise<StoredEvent[]>;

  /**
   * Get all events for an aggregate type
   */
  getEventsByAggregateType(aggregateType: string): Promise<StoredEvent[]>;
}

/**
 * Snapshot interface for event sourcing
 */
export interface Snapshot<T> {
  aggregateId: string;
  aggregateType: string;
  state: T;
  version: number;
  createdAt: Date;
}

/**
 * Snapshot store interface
 */
export interface ISnapshotStore<T> {
  /**
   * Get snapshot for an aggregate
   */
  getSnapshot(aggregateId: string): Promise<Snapshot<T> | null>;

  /**
   * Save snapshot for an aggregate
   */
  saveSnapshot(snapshot: Snapshot<T>): Promise<void>;

  /**
   * Delete snapshot for an aggregate
   */
  deleteSnapshot(aggregateId: string): Promise<void>;
}
