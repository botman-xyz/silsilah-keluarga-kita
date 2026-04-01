/**
 * Firebase Event Store Implementation
 * Stores domain events in Firebase Firestore
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import { DomainEvent } from '../../domain/events';
import { IEventStore, StoredEvent } from '../../domain/events/EventStore';

export class FirebaseEventStore implements IEventStore {
  private collectionName = 'domainEvents';

  /**
   * Append an event to the store
   */
  async append(event: DomainEvent, metadata?: Record<string, unknown>): Promise<void> {
    try {
      const storedEvent: Omit<StoredEvent, 'id'> = {
        aggregateId: event.aggregateId,
        aggregateType: this.getAggregateType(event.eventType),
        eventType: event.eventType,
        eventData: JSON.stringify(event),
        version: await this.getNextVersion(event.aggregateId),
        occurredAt: event.occurredAt,
        metadata
      };

      await addDoc(collection(db, this.collectionName), storedEvent);
    } catch (error) {
      console.error('Error appending event to store:', error);
      throw error;
    }
  }

  /**
   * Get all events for an aggregate
   */
  async getEvents(aggregateId: string): Promise<StoredEvent[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('aggregateId', '==', aggregateId),
        orderBy('version', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StoredEvent[];
    } catch (error) {
      console.error('Error getting events from store:', error);
      throw error;
    }
  }

  /**
   * Get events for an aggregate since a specific version
   */
  async getEventsSince(aggregateId: string, version: number): Promise<StoredEvent[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('aggregateId', '==', aggregateId),
        where('version', '>', version),
        orderBy('version', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StoredEvent[];
    } catch (error) {
      console.error('Error getting events since version:', error);
      throw error;
    }
  }

  /**
   * Get all events of a specific type
   */
  async getEventsByType(eventType: string): Promise<StoredEvent[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('eventType', '==', eventType),
        orderBy('occurredAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StoredEvent[];
    } catch (error) {
      console.error('Error getting events by type:', error);
      throw error;
    }
  }

  /**
   * Get all events for an aggregate type
   */
  async getEventsByAggregateType(aggregateType: string): Promise<StoredEvent[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('aggregateType', '==', aggregateType),
        orderBy('occurredAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StoredEvent[];
    } catch (error) {
      console.error('Error getting events by aggregate type:', error);
      throw error;
    }
  }

  /**
   * Get next version for an aggregate
   */
  private async getNextVersion(aggregateId: string): Promise<number> {
    const events = await this.getEvents(aggregateId);
    return events.length > 0 ? Math.max(...events.map(e => e.version)) + 1 : 1;
  }

  /**
   * Get aggregate type from event type
   */
  private getAggregateType(eventType: string): string {
    if (eventType.startsWith('Family')) return 'Family';
    if (eventType.startsWith('Member')) return 'Member';
    if (eventType.startsWith('Collaborator')) return 'Collaborator';
    if (eventType.startsWith('Parent')) return 'Member';
    if (eventType.startsWith('Spouse')) return 'Member';
    return 'Unknown';
  }
}
