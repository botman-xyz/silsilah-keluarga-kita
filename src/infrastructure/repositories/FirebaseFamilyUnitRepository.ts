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
import { FamilyUnit } from '../../domain/entities';
import { IFamilyUnitRepository } from '../../domain/repositories';
import { handleFirestoreError, OperationType } from '../../firebase';

/**
 * Firebase implementation of IFamilyUnitRepository
 * 
 * Stores FamilyUnits in: families/{familyId}/familyUnits/{unitId}
 */
export class FirebaseFamilyUnitRepository implements IFamilyUnitRepository {
  private getCollection(familyId: string) {
    return collection(db, 'families', familyId, 'familyUnits');
  }

  async getByFamilyId(familyId: string): Promise<FamilyUnit[]> {
    try {
      const q = query(this.getCollection(familyId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as FamilyUnit));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `families/${familyId}/familyUnits`);
      return [];
    }
  }

  async getById(familyId: string, unitId: string): Promise<FamilyUnit | null> {
    try {
      const docRef = doc(db, 'families', familyId, 'familyUnits', unitId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as FamilyUnit;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `families/${familyId}/familyUnits/${unitId}`);
      return null;
    }
  }

  async getByMemberId(familyId: string, memberId: string): Promise<FamilyUnit | null> {
    try {
      const units = await this.getByFamilyId(familyId);
      return units.find(unit => 
        unit.husbandId === memberId || 
        unit.wifeId === memberId ||
        unit.childrenIds.includes(memberId)
      ) || null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `families/${familyId}/familyUnits`);
      return null;
    }
  }

  async create(familyId: string, unit: Omit<FamilyUnit, 'id' | 'createdAt' | 'updatedAt'>): Promise<FamilyUnit> {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(this.getCollection(familyId), {
        ...unit,
        createdAt: now,
        updatedAt: now,
        status: unit.status || 'active',
        childrenIds: unit.childrenIds || []
      });
      return { 
        id: docRef.id, 
        ...unit,
        createdAt: now,
        updatedAt: now,
        status: unit.status || 'active',
        childrenIds: unit.childrenIds || []
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `families/${familyId}/familyUnits`);
      throw error;
    }
  }

  async update(familyId: string, unitId: string, data: Partial<FamilyUnit>): Promise<void> {
    try {
      const docRef = doc(db, 'families', familyId, 'familyUnits', unitId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `families/${familyId}/familyUnits/${unitId}`);
      throw error;
    }
  }

  async delete(familyId: string, unitId: string): Promise<void> {
    try {
      const docRef = doc(db, 'families', familyId, 'familyUnits', unitId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `families/${familyId}/familyUnits/${unitId}`);
      throw error;
    }
  }

  async addChild(familyId: string, unitId: string, childId: string): Promise<void> {
    const unit = await this.getById(familyId, unitId);
    if (!unit) throw new Error('FamilyUnit not found');
    
    if (!unit.childrenIds.includes(childId)) {
      await this.update(familyId, unitId, {
        childrenIds: [...unit.childrenIds, childId]
      });
    }
  }

  async removeChild(familyId: string, unitId: string, childId: string): Promise<void> {
    const unit = await this.getById(familyId, unitId);
    if (!unit) throw new Error('FamilyUnit not found');
    
    await this.update(familyId, unitId, {
      childrenIds: unit.childrenIds.filter(id => id !== childId)
    });
  }

  subscribeByFamilyId(familyId: string, callback: (units: FamilyUnit[]) => void): () => void {
    const q = query(this.getCollection(familyId));
    return onSnapshot(q, (snapshot) => {
      const units = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as FamilyUnit));
      callback(units);
    });
  }
}
