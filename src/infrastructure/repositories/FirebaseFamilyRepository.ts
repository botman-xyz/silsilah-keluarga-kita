import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Family } from '../../domain/entities';
import { IFamilyRepository } from '../../domain/repositories';
import { handleFirestoreError, OperationType } from '../../firebase';

/**
 * Firebase implementation of IFamilyRepository
 */
export class FirebaseFamilyRepository implements IFamilyRepository {
  private collectionName = 'families';

  async getByOwnerId(userId: string): Promise<Family[]> {
    try {
      const q = query(collection(db, this.collectionName), where('ownerId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Family));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'families/owner');
      return [];
    }
  }

  async getByCollaborator(userId: string): Promise<Family[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('collaborators', 'array-contains', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Family));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'families/collaborator');
      return [];
    }
  }

  async getById(familyId: string): Promise<Family | null> {
    try {
      const docRef = doc(db, this.collectionName, familyId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Family;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `families/${familyId}`);
      return null;
    }
  }

  async create(family: Omit<Family, 'id'>): Promise<Family> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...family,
        createdAt: family.createdAt || Timestamp.now().toString()
      });
      return { id: docRef.id, ...family };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'families');
      throw error;
    }
  }

  async update(familyId: string, data: Partial<Family>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, familyId);
      await updateDoc(docRef, data as Record<string, unknown>);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `families/${familyId}`);
      throw error;
    }
  }

  async delete(familyId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, familyId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `families/${familyId}`);
      throw error;
    }
  }

  subscribeByOwnerId(userId: string, callback: (families: Family[]) => void): () => void {
    const q = query(collection(db, this.collectionName), where('ownerId', '==', userId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const families = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Family));
      callback(families);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'families/owner'));

    return unsubscribe;
  }

  subscribeByCollaborator(userId: string, callback: (families: Family[]) => void): () => void {
    const q = query(
      collection(db, this.collectionName),
      where('collaborators', 'array-contains', userId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const families = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Family));
      callback(families);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'families/collaborator'));

    return unsubscribe;
  }
}
