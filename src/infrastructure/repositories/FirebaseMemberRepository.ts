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
  deleteDoc
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
      
      // Check if document exists first
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error(`Document not found: families/${familyId}/people/${memberId}`);
        throw new Error('Anggota keluarga tidak ditemukan atau sudah dihapus.');
      }
      
      await updateDoc(docRef, data as Record<string, unknown>);
    } catch (error) {
      if (error instanceof Error && error.message.includes('tidak ditemukan')) {
        throw error;
      }
      handleFirestoreError(error, OperationType.UPDATE, `families/${familyId}/members/${memberId}`);
      throw error;
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
}
