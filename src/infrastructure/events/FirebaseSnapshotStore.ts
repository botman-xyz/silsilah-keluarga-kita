/**
 * Firebase Snapshot Store Implementation
 * Stores aggregate snapshots in Firebase Firestore
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import { ISnapshotStore, Snapshot } from '../../domain/events/EventStore';

export class FirebaseSnapshotStore<T> implements ISnapshotStore<T> {
  private collectionName = 'aggregateSnapshots';

  /**
   * Get snapshot for an aggregate
   */
  async getSnapshot(aggregateId: string): Promise<Snapshot<T> | null> {
    try {
      const docRef = doc(db, this.collectionName, aggregateId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          aggregateId: data.aggregateId,
          aggregateType: data.aggregateType,
          state: JSON.parse(data.state) as T,
          version: data.version,
          createdAt: data.createdAt.toDate()
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting snapshot:', error);
      throw error;
    }
  }

  /**
   * Save snapshot for an aggregate
   */
  async saveSnapshot(snapshot: Snapshot<T>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, snapshot.aggregateId);
      await setDoc(docRef, {
        aggregateId: snapshot.aggregateId,
        aggregateType: snapshot.aggregateType,
        state: JSON.stringify(snapshot.state),
        version: snapshot.version,
        createdAt: Timestamp.fromDate(snapshot.createdAt)
      });
    } catch (error) {
      console.error('Error saving snapshot:', error);
      throw error;
    }
  }

  /**
   * Delete snapshot for an aggregate
   */
  async deleteSnapshot(aggregateId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, aggregateId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting snapshot:', error);
      throw error;
    }
  }
}
