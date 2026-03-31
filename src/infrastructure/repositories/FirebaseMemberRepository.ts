import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Member } from '../../domain/entities';
import { IMemberRepository } from '../../domain/repositories';
import { handleFirestoreError, OperationType } from '../../firebase';

/**
 * Firebase implementation of IMemberRepository
 */
export class FirebaseMemberRepository implements IMemberRepository {
  private getMembersCollection(familyId: string) {
    return collection(db, 'families', familyId, 'people');
  }

  async getByFamilyId(familyId: string): Promise<Member[]> {
    try {
      const q = query(this.getMembersCollection(familyId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ 
        id: d.id, 
        familyId,
        ...d.data() 
      } as Member));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `families/${familyId}/members`);
      return [];
    }
  }

  async getById(familyId: string, memberId: string): Promise<Member | null> {
    try {
      const docRef = doc(db, 'families', familyId, 'people', memberId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, familyId, ...docSnap.data() } as Member;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `families/${familyId}/members/${memberId}`);
      return null;
    }
  }

  async create(familyId: string, member: Omit<Member, 'id'>): Promise<Member> {
    try {
      const docRef = await addDoc(this.getMembersCollection(familyId), {
        ...member,
        familyId
      });
      return { id: docRef.id, ...member };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `families/${familyId}/members`);
      throw error;
    }
  }

  async update(familyId: string, memberId: string, data: Partial<Member>): Promise<void> {
    try {
      const docRef = doc(db, 'families', familyId, 'people', memberId);
      
      // Check if document exists before updating
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        // Check if member exists in a different family (mantu scenario)
        // Search across all families to find the member
        const allFamilies = await this.getAllFamilies();
        for (const otherFamilyId of allFamilies) {
          const memberDocRef = doc(db, 'families', otherFamilyId, 'people', memberId);
          const memberSnap = await getDoc(memberDocRef);
          if (memberSnap.exists()) {
            const memberData = memberSnap.data() as Member;
            // If familyId changed, log it for debugging
            if (memberData.familyId && memberData.familyId !== familyId) {
              console.log(`Member found in different family, updating familyId: ${memberData.familyId} -> ${familyId}`);
            }
            // Member exists in different family - this is a mantu (in-law) scenario
            // Update the member in their original family first
            await updateDoc(memberDocRef, data as Record<string, unknown>);
            return;
          }
        }
        // Document doesn't exist anywhere - log and skip silently
        console.warn(`Document not found: families/${familyId}/people/${memberId}`);
        return;
      }
      
      await updateDoc(docRef, data as Record<string, unknown>);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `families/${familyId}/members/${memberId}`);
      throw error;
    }
  }

  /**
   * Get all family IDs for cross-family search
   */
  private async getAllFamilies(): Promise<string[]> {
    try {
      const familiesRef = collection(db, 'families');
      const snapshot = await getDocs(familiesRef);
      return snapshot.docs.map(d => d.id);
    } catch {
      return [];
    }
  }

  async delete(familyId: string, memberId: string): Promise<void> {
    try {
      const docRef = doc(db, 'families', familyId, 'people', memberId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `families/${familyId}/members/${memberId}`);
      throw error;
    }
  }

  subscribeByFamilyId(familyId: string, callback: (members: Member[]) => void): () => void {
    const q = query(this.getMembersCollection(familyId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const members = snapshot.docs.map(d => ({ 
        id: d.id, 
        familyId,
        ...d.data() 
      } as Member));
      callback(members);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `families/${familyId}/members`));

    return unsubscribe;
  }

  /**
   * Batch update multiple members atomically using Firebase write batch
   */
  async batchUpdate(familyId: string, updates: Array<{ memberId: string; data: Partial<Member> }>): Promise<void> {
    if (updates.length === 0) return;
    
    try {
      const batch = writeBatch(db);
      
      for (const { memberId, data } of updates) {
        const docRef = doc(db, 'families', familyId, 'people', memberId);
        batch.update(docRef, {
          ...data,
          updatedAt: new Date().toISOString()
        } as Record<string, unknown>);
      }
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `families/${familyId}/members (batch)`);
      throw error;
    }
  }
}
