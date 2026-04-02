import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { 
  initializeTestEnvironment, 
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

// Test configuration
const TEST_PROJECT_ID = 'silsilah-keluarga-kita-test';

// Helper interface for test member
interface TestMember {
  id: string;
  familyId: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  createdBy: string;
  updatedAt: string;
}

describe('Firebase Emulator Integration Tests', () => {
  let testEnv: RulesTestEnvironment;
  let db: any;
  let emulatorAvailable = false;

  // Helper to create family with membership
  async function createTestFamily(familyId: string, familyName: string, ownerId: string) {
    await setDoc(doc(db, 'families', familyId), {
      name: familyName,
      ownerId,
      collaborators: [],
      createdAt: new Date().toISOString()
    });

    // Add the owner as a member
    await setDoc(doc(db, 'families', familyId, 'members', ownerId), {
      userId: ownerId,
      role: 'owner',
      joinedAt: new Date().toISOString()
    });
  }

  beforeAll(async () => {
    try {
      // Initialize test environment with emulator (already running on port 8080)
      testEnv = await initializeTestEnvironment({
        projectId: TEST_PROJECT_ID,
        firestore: {
          rules: readFileSync(join(process.cwd(), 'firestore.rules'), 'utf8'),
          host: '127.0.0.1',
          port: 8080
        }
      });
      
      console.log('🔥 Firebase Emulator initialized at 127.0.0.1:8080');
      emulatorAvailable = true;
    } catch (error) {
      console.warn('⚠️ Firebase Emulator not available, skipping tests:', error);
      emulatorAvailable = false;
    }
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (!emulatorAvailable) {
      return;
    }

    // Get authenticated Firestore instance for each test with auth token
    db = testEnv.authenticatedContext('test-user', {
      email: 'test@example.com',
      email_verified: true
    }).firestore();

    // Clear Firestore before each test
    await testEnv.clearFirestore();

    // Create test user document
    await setDoc(doc(db, 'users', 'test-user'), {
      uid: 'test-user',
      displayName: 'Test User',
      photoURL: '',
      createdAt: new Date().toISOString(),
      role: 'user'
    });
  });

  describe('Firestore CRUD Operations', () => {
    it('should create a family document', async () => {
       if (!emulatorAvailable) {
         return;
       }

       await createTestFamily('test-family-1', 'Keluarga Utama', 'test-user');

       const docSnap = await getDoc(doc(db, 'families', 'test-family-1'));
       expect(docSnap.exists()).toBe(true);
       expect(docSnap.data().name).toBe('Keluarga Utama');
     });

    it('should create a member in a family', async () => {
       if (!emulatorAvailable) {
         return;
       }

       await createTestFamily('test-family-1', 'Keluarga Utama', 'test-user');

       // Then create a member
       const memberData: TestMember = {
         id: 'member-1',
         familyId: 'test-family-1',
         name: 'John Doe',
         gender: 'male',
         createdBy: 'test-user',
         updatedAt: new Date().toISOString()
       };

       await setDoc(doc(db, 'families', 'test-family-1', 'people', 'member-1'), memberData);

       const docSnap = await getDoc(doc(db, 'families', 'test-family-1', 'people', 'member-1'));
       expect(docSnap.exists()).toBe(true);
       expect(docSnap.data().name).toBe('John Doe');
       expect(docSnap.data().gender).toBe('male');
     });

    it('should update a member document', async () => {
      if (!emulatorAvailable) {
        return;
      }

      // Create family and member
      await setDoc(doc(db, 'families', 'test-family-1'), {
        name: 'Keluarga Utama',
        ownerId: 'test-user',
        collaborators: [],
        createdAt: new Date().toISOString()
      });

      await setDoc(doc(db, 'families', 'test-family-1', 'people', 'member-1'), {
        id: 'member-1',
        familyId: 'test-family-1',
        name: 'John Doe',
        gender: 'male',
        createdBy: 'test-user',
        updatedAt: new Date().toISOString()
      });

      // Update the member
      await updateDoc(doc(db, 'families', 'test-family-1', 'people', 'member-1'), {
        name: 'John Smith',
        updatedAt: new Date().toISOString()
      });

      const docSnap = await getDoc(doc(db, 'families', 'test-family-1', 'people', 'member-1'));
      expect(docSnap.data().name).toBe('John Smith');
    });

    it('should delete a member document', async () => {
      if (!emulatorAvailable) {
        return;
      }

      // Create family and member
      await setDoc(doc(db, 'families', 'test-family-1'), {
        name: 'Keluarga Utama',
        ownerId: 'test-user',
        collaborators: [],
        createdAt: new Date().toISOString()
      });

      await setDoc(doc(db, 'families', 'test-family-1', 'people', 'member-1'), {
        id: 'member-1',
        familyId: 'test-family-1',
        name: 'John Doe',
        gender: 'male',
        createdBy: 'test-user',
        updatedAt: new Date().toISOString()
      });

      // Delete the member
      await deleteDoc(doc(db, 'families', 'test-family-1', 'people', 'member-1'));

      const docSnap = await getDoc(doc(db, 'families', 'test-family-1', 'people', 'member-1'));
      expect(docSnap.exists()).toBe(false);
    });

    it('should get all members in a family', async () => {
      if (!emulatorAvailable) {
        return;
      }

      // Create family
      await setDoc(doc(db, 'families', 'test-family-1'), {
        name: 'Keluarga Utama',
        ownerId: 'test-user',
        collaborators: [],
        createdAt: new Date().toISOString()
      });

      // Create multiple members
      const members = [
        { id: 'member-1', name: 'Father', gender: 'male' as const },
        { id: 'member-2', name: 'Mother', gender: 'female' as const },
        { id: 'member-3', name: 'Child', gender: 'male' as const }
      ];

      for (const member of members) {
        await setDoc(doc(db, 'families', 'test-family-1', 'people', member.id), {
          ...member,
          familyId: 'test-family-1',
          createdBy: 'test-user',
          updatedAt: new Date().toISOString()
        });
      }

      const querySnapshot = await getDocs(collection(db, 'families', 'test-family-1', 'people'));
      expect(querySnapshot.size).toBe(3);
    });
  });

  describe('Family Tree Relationships', () => {
    beforeEach(async () => {
      if (!emulatorAvailable) {
        return;
      }

      // Create main family
      await setDoc(doc(db, 'families', 'utama'), {
        name: 'Keluarga Utama',
        ownerId: 'test-user',
        collaborators: [],
        createdAt: new Date().toISOString()
      });

      // Create mantu (in-law) family
      await setDoc(doc(db, 'families', 'mantu'), {
        name: 'Keluarga Mantu',
        ownerId: 'test-user',
        collaborators: [],
        createdAt: new Date().toISOString()
      });
    });

    it('should handle members from different families (mantu scenario)', async () => {
      if (!emulatorAvailable) {
        return;
      }

      // Create father from utama family
      await setDoc(doc(db, 'families', 'utama', 'people', 'father-1'), {
        id: 'father-1',
        familyId: 'utama',
        name: 'Bapak',
        gender: 'male',
        createdBy: 'test-user',
        updatedAt: new Date().toISOString()
      });

      // Create ibu (mantu) from different family - will move to utama after marriage
      await setDoc(doc(db, 'families', 'mantu', 'people', 'mother-1'), {
        id: 'mother-1',
        familyId: 'mantu', // Initially in mantu family before marriage
        externalFamilyId: 'mantu',
        name: 'Ibu',
        gender: 'female',
        spouseId: 'father-1',
        spouseIds: ['father-1'],
        maritalStatus: 'married',
        createdBy: 'test-user',
        updatedAt: new Date().toISOString()
      });

      // Verify mother exists in mantu family (before marriage transfer)
      const motherSnapInMantu = await getDoc(doc(db, 'families', 'mantu', 'people', 'mother-1'));
      expect(motherSnapInMantu.exists()).toBe(true);
      expect(motherSnapInMantu.data().familyId).toBe('mantu');
      expect(motherSnapInMantu.data().externalFamilyId).toBe('mantu');
    });

    it('should create parent-child relationship', async () => {
      if (!emulatorAvailable) {
        return;
      }

      // Create parents
      await setDoc(doc(db, 'families', 'utama', 'people', 'father-1'), {
        id: 'father-1',
        familyId: 'utama',
        name: 'Bapak',
        gender: 'male',
        createdBy: 'test-user',
        updatedAt: new Date().toISOString()
      });

      await setDoc(doc(db, 'families', 'utama', 'people', 'mother-1'), {
        id: 'mother-1',
        familyId: 'utama',
        name: 'Ibu',
        gender: 'female',
        createdBy: 'test-user',
        updatedAt: new Date().toISOString()
      });

      // Create child with parent references
      await setDoc(doc(db, 'families', 'utama', 'people', 'child-1'), {
        id: 'child-1',
        familyId: 'utama',
        name: 'Anak',
        gender: 'male',
        fatherId: 'father-1',
        motherId: 'mother-1',
        createdBy: 'test-user',
        updatedAt: new Date().toISOString()
      });

      const childSnap = await getDoc(doc(db, 'families', 'utama', 'people', 'child-1'));
      expect(childSnap.data().fatherId).toBe('father-1');
      expect(childSnap.data().motherId).toBe('mother-1');
    });

    it('should create spouse relationship', async () => {
      if (!emulatorAvailable) {
        return;
      }

      // Create husband
      await setDoc(doc(db, 'families', 'utama', 'people', 'husband-1'), {
        id: 'husband-1',
        familyId: 'utama',
        name: 'Suami',
        gender: 'male',
        spouseId: 'wife-1',
        spouseIds: ['wife-1'],
        maritalStatus: 'married',
        createdBy: 'test-user',
        updatedAt: new Date().toISOString()
      });

      // Create wife
      await setDoc(doc(db, 'families', 'utama', 'people', 'wife-1'), {
        id: 'wife-1',
        familyId: 'utama',
        name: 'Istri',
        gender: 'female',
        spouseId: 'husband-1',
        spouseIds: ['husband-1'],
        maritalStatus: 'married',
        createdBy: 'test-user',
        updatedAt: new Date().toISOString()
      });

      const husbandSnap = await getDoc(doc(db, 'families', 'utama', 'people', 'husband-1'));
      const wifeSnap = await getDoc(doc(db, 'families', 'utama', 'people', 'wife-1'));

      expect(husbandSnap.data().spouseId).toBe('wife-1');
      expect(wifeSnap.data().spouseId).toBe('husband-1');
    });
  });

  describe('Document Not Found Scenario (Error Case)', () => {
    it('should handle updating non-existent document', async () => {
      if (!emulatorAvailable) {
        return;
      }

      // Try to update a document that doesn't exist
      const nonExistentDoc = doc(db, 'families', 'test-family-1', 'people', 'non-existent');
      
      // This should fail with "not found" error
      try {
        await updateDoc(nonExistentDoc, { name: 'Test' });
        // If we get here, the update somehow succeeded (shouldn't happen)
        expect(true).toBe(false);
      } catch (error: any) {
        // Expected to fail - document doesn't exist
        // Firestore emulator returns: "5 NOT_FOUND: no entity to update"
        expect(error.message).toMatch(/NOT_FOUND|no entity to update|not found/i);
      }
    });

    it('should handle deleting non-existent document', async () => {
      if (!emulatorAvailable) {
        return;
      }

      // Try to delete a document that doesn't exist
      const nonExistentDoc = doc(db, 'families', 'test-family-1', 'people', 'non-existent');
      
      // deleteDoc doesn't throw error for non-existent docs in Firestore
      // but let's verify it doesn't crash
      await expect(deleteDoc(nonExistentDoc)).resolves.not.toThrow();
    });
  });

  describe('5 Generation Family Tree', () => {
    beforeEach(async () => {
      if (!emulatorAvailable) {
        return;
      }

      // Create main family
      await setDoc(doc(db, 'families', 'utama'), {
        name: 'Keluarga Utama',
        ownerId: 'test-user',
        collaborators: [],
        createdAt: new Date().toISOString()
      });
    });

    it('should create 5 generation family tree', async () => {
      if (!emulatorAvailable) {
        return;
      }

      // Generation 1: Kakek & Nenek
      await setDoc(doc(db, 'families', 'utama', 'people', 'kakek'), {
        id: 'kakek',
        familyId: 'utama',
        name: 'Kakek',
        gender: 'male',
        createdBy: 'test-user',
        updatedAt: new Date().toISOString()
      });

      await setDoc(doc(db, 'families', 'utama', 'people', 'nenek'), {
        id: 'nenek',
        familyId: 'utama',
        name: 'Nenek',
        gender: 'female',
        spouseId: 'kakek',
        spouseIds: ['kakek'],
        maritalStatus: 'married',
        createdBy: 'test-user',
        updatedAt: new Date().toISOString()
      });

      // Generation 2: Parents (Ayah & Ibu - ibu is menantu)
      await setDoc(doc(db, 'families', 'utama', 'people', 'ayah'), {
        id: 'ayah',
        familyId: 'utama',
        name: 'Ayah',
        gender: 'male',
        fatherId: 'kakek',
        motherId: 'nenek',
        createdBy: 'test-user',
        updatedAt: new Date().toISOString()
      });

      await setDoc(doc(db, 'families', 'mantu', 'people', 'ibu-mantu'), {
        id: 'ibu-mantu',
        familyId: 'utama',
        name: 'Ibu (Mantu)',
        gender: 'female',
        externalFamilyId: 'mantu',
        spouseId: 'ayah',
        spouseIds: ['ayah'],
        maritalStatus: 'married',
        createdBy: 'test-user',
        updatedAt: new Date().toISOString()
      });

      // Generation 3: Children
      await setDoc(doc(db, 'families', 'utama', 'people', 'anak1'), {
        id: 'anak1',
        familyId: 'utama',
        name: 'Anak 1',
        gender: 'male',
        fatherId: 'ayah',
        motherId: 'ibu-mantu',
        createdBy: 'test-user',
        updatedAt: new Date().toISOString()
      });

      // Add spouse for anak1 (mantu)
      await setDoc(doc(db, 'families', 'mantu2', 'people', 'menantu1'), {
        id: 'menantu1',
        familyId: 'utama',
        name: 'Menantu 1',
        gender: 'female',
        externalFamilyId: 'mantu2',
        spouseId: 'anak1',
        spouseIds: ['anak1'],
        maritalStatus: 'married',
        createdBy: 'test-user',
        updatedAt: new Date().toISOString()
      });

      // Generation 4: Grandchildren (Cucu)
      await setDoc(doc(db, 'families', 'utama', 'people', 'cucu1'), {
        id: 'cucu1',
        familyId: 'utama',
        name: 'Cucu 1',
        gender: 'male',
        fatherId: 'anak1',
        motherId: 'menantu1',
        createdBy: 'test-user',
        updatedAt: new Date().toISOString()
      });

      // Generation 5: Great-grandchildren (Buyut)
      await setDoc(doc(db, 'families', 'utama', 'people', 'buyut'), {
        id: 'buyut',
        familyId: 'utama',
        name: 'Buyut',
        gender: 'male',
        fatherId: 'cucu1',
        createdBy: 'test-user',
        updatedAt: new Date().toISOString()
      });

      // Verify the tree structure
      const kakekSnap = await getDoc(doc(db, 'families', 'utama', 'people', 'kakek'));
      const ayahSnap = await getDoc(doc(db, 'families', 'utama', 'people', 'ayah'));
      const anak1Snap = await getDoc(doc(db, 'families', 'utama', 'people', 'anak1'));
      const cucu1Snap = await getDoc(doc(db, 'families', 'utama', 'people', 'cucu1'));
      const buyutSnap = await getDoc(doc(db, 'families', 'utama', 'people', 'buyut'));

      // Verify parent-child relationships
      expect(ayahSnap.data().fatherId).toBe('kakek');
      expect(anak1Snap.data().fatherId).toBe('ayah');
      expect(cucu1Snap.data().fatherId).toBe('anak1');
      expect(buyutSnap.data().fatherId).toBe('cucu1');

      // Verify all belong to the same family
      expect(kakekSnap.data().familyId).toBe('utama');
      expect(ayahSnap.data().familyId).toBe('utama');
      expect(anak1Snap.data().familyId).toBe('utama');
      expect(cucu1Snap.data().familyId).toBe('utama');
      expect(buyutSnap.data().familyId).toBe('utama');
    });
  });
});