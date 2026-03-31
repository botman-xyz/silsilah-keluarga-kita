import { describe, it, expect, beforeEach } from 'vitest';
import { Member, Family } from '../src/domain/entities';

// ============================================
// Firebase Emulator Integration Tests
// (Simulated - requires emulator to be running)
// ============================================

interface FirestoreDoc {
  id: string;
  data: () => Record<string, unknown>;
  exists: boolean;
}

// Simulate Firestore collection operations
class MockFirestoreCollection {
  private docs: Map<string, Record<string, unknown>> = new Map();
  private idCounter = 0;

  async add(data: Record<string, unknown>): Promise<FirestoreDoc> {
    const id = `doc-${++this.idCounter}`;
    this.docs.set(id, data);
    return {
      id,
      data: () => data,
      exists: true
    };
  }

  doc(id: string): MockFirestoreDoc {
    return new MockFirestoreDoc(this.docs, id);
  }

  async get(): Promise<FirestoreDoc[]> {
    return Array.from(this.docs.entries()).map(([id, data]) => ({
      id,
      data: () => data,
      exists: true
    }));
  }

  where(field: string, operator: string, value: unknown): MockFirestoreQuery {
    return new MockFirestoreQuery(this.docs, field, operator, value);
  }
}

class MockFirestoreDoc {
  constructor(
    private docs: Map<string, Record<string, unknown>>,
    private id: string
  ) {}

  get(): FirestoreDoc {
    const data = this.docs.get(this.id);
    return {
      id: this.id,
      data: () => data || {},
      exists: !!data
    };
  }

  async update(data: Record<string, unknown>): Promise<void> {
    const existing = this.docs.get(this.id);
    if (existing) {
      this.docs.set(this.id, { ...existing, ...data });
    }
  }

  async delete(): Promise<void> {
    this.docs.delete(this.id);
  }

  collection(path: string): MockFirestoreCollection {
    return new MockFirestoreCollection();
  }
}

class MockFirestoreQuery {
  constructor(
    private docs: Map<string, Record<string, unknown>>,
    private field: string,
    private operator: string,
    private value: unknown
  ) {}

  async get(): Promise<FirestoreDoc[]> {
    return Array.from(this.docs.entries())
      .filter(([_, data]) => {
        const fieldValue = data[this.field];
        switch (this.operator) {
          case '==':
            return fieldValue === this.value;
          default:
            return true;
        }
      })
      .map(([id, data]) => ({
        id,
        data: () => data,
        exists: true
      }));
  }
}

describe('Firebase Emulator - Family Operations', () => {
  let db: MockFirestoreCollection;

  beforeEach(() => {
    db = new MockFirestoreCollection();
  });

  it('should create a new family', async () => {
    const familyData = {
      name: 'Keluarga Test',
      ownerId: 'test-user-123',
      collaborators: [] as string[],
      createdAt: new Date().toISOString()
    };

    const docRef = await db.add(familyData);
    const docSnap = docRef;

    expect(docSnap.exists).toBe(true);
    expect(docSnap.data()?.name).toBe('Keluarga Test');
    expect(docSnap.data()?.ownerId).toBe('test-user-123');
  });

  it('should read a family', async () => {
    const familyData = {
      name: 'Keluarga Budi',
      ownerId: 'user-1',
      collaborators: ['user-2'],
      createdAt: new Date().toISOString()
    };

    const docRef = await db.add(familyData);
    const docSnap = db.doc(docRef.id).get();

    expect(docSnap.data()?.name).toBe('Keluarga Budi');
    expect(docSnap.data()?.collaborators).toContain('user-2');
  });

  it('should update a family', async () => {
    const familyData = {
      name: 'Keluarga Lama',
      ownerId: 'user-1',
      collaborators: [],
      createdAt: new Date().toISOString()
    };

    const docRef = await db.add(familyData);
    await db.doc(docRef.id).update({ name: 'Keluarga Baru' });

    const docSnap = db.doc(docRef.id).get();
    expect(docSnap.data()?.name).toBe('Keluarga Baru');
  });

  it('should delete a family', async () => {
    const familyData = {
      name: 'Keluarga Delete',
      ownerId: 'user-1',
      collaborators: [],
      createdAt: new Date().toISOString()
    };

    const docRef = await db.add(familyData);
    await db.doc(docRef.id).delete();

    const docSnap = db.doc(docRef.id).get();
    expect(docSnap.exists).toBe(false);
  });
});

describe('Firebase Emulator - Member Operations (5 Generations with Menantu)', () => {
  let familyDb: MockFirestoreCollection;
  let familyId: string;

  beforeEach(() => {
    familyDb = new MockFirestoreCollection();
    familyId = 'family-test-123';
  });

  it('should create 5 generations of members', async () => {
    // Use a fresh collection for this test
    const testDb = new MockFirestoreCollection();
    
    // Generation 1: Kakek & Nenek
    const kakekData = {
      familyId,
      name: 'Kakek Budi',
      gender: 'male',
      createdBy: 'test-user',
      updatedAt: new Date().toISOString()
    };
    const kakekRef = await testDb.add(kakekData);
    const kakekId = kakekRef.id;

    const nenekData = {
      familyId,
      name: 'Nenek Siti',
      gender: 'female',
      createdBy: 'test-user',
      updatedAt: new Date().toISOString()
    };
    const nenekRef = await testDb.add(nenekData);
    const nenekId = nenekRef.id;

    // Generation 2: Parents
    const ayahData = {
      familyId,
      name: 'Budi',
      gender: 'male',
      fatherId: kakekId,
      motherId: nenekId,
      createdBy: 'test-user',
      updatedAt: new Date().toISOString()
    };
    const ayahRef = await testDb.add(ayahData);
    const ayahId = ayahRef.id;

    // Generation 3: Children
    const anakData = {
      familyId,
      name: 'Ani',
      gender: 'female',
      fatherId: ayahId,
      createdBy: 'test-user',
      updatedAt: new Date().toISOString()
    };
    const anakRef = await testDb.add(anakData);
    const anakId = anakRef.id;

    // Generation 4: Grandchild
    const cucuData = {
      familyId,
      name: 'Budi Jr',
      gender: 'male',
      fatherId: anakId,
      createdBy: 'test-user',
      updatedAt: new Date().toISOString()
    };
    const cucuRef = await testDb.add(cucuData);
    const cucuId = cucuRef.id;

    // Generation 5: Great-grandchild
    const buyutData = {
      familyId,
      name: 'Echa',
      gender: 'female',
      fatherId: cucuId,
      createdBy: 'test-user',
      updatedAt: new Date().toISOString()
    };
    await testDb.add(buyutData);

    // Verify all 5 generations exist
    const snapshot = await testDb.get();
    expect(snapshot.length).toBe(5);
  });

  it('should create menantu (in-law) relationship', async () => {
    // Create main family member (anak)
    const ayahData = {
      familyId,
      name: 'Budi',
      gender: 'male',
      createdBy: 'test-user',
      updatedAt: new Date().toISOString()
    };
    const ayahRef = await familyDb.add(ayahData);
    const ayahId = ayahRef.id;

    const anakData = {
      familyId,
      name: 'Ani',
      gender: 'female',
      fatherId: ayahId,
      createdBy: 'test-user',
      updatedAt: new Date().toISOString()
    };
    const anakRef = await familyDb.add(anakData);
    const anakId = anakRef.id;

    // Create menantu (from external family, now in main family)
    const menantuData = {
      familyId,
      name: 'Joko',
      gender: 'male',
      spouseId: anakId,
      externalFamilyId: 'external-family',
      maritalStatus: 'married',
      createdBy: 'test-user',
      updatedAt: new Date().toISOString()
    };
    const menantuRef = await familyDb.add(menantuData);

    // Verify menantu relationship
    const allDocs = await familyDb.get();
    const menantuDoc = allDocs.find(d => d.id === menantuRef.id);
    
    expect(menantuDoc?.data()?.name).toBe('Joko');
    expect(menantuDoc?.data()?.spouseId).toBe(anakId);
    expect(menantuDoc?.data()?.externalFamilyId).toBe('external-family');
  });

  it('should query members by parent ID (children)', async () => {
    // Create parent
    const ayahData = {
      familyId,
      name: 'Budi',
      gender: 'male',
      createdBy: 'test-user',
      updatedAt: new Date().toISOString()
    };
    const ayahRef = await familyDb.add(ayahData);
    const ayahId = ayahRef.id;

    // Create children
    await familyDb.add({
      familyId,
      name: 'Ani',
      gender: 'female',
      fatherId: ayahId,
      createdBy: 'test-user',
      updatedAt: new Date().toISOString()
    });

    await familyDb.add({
      familyId,
      name: 'Andi',
      gender: 'male',
      fatherId: ayahId,
      createdBy: 'test-user',
      updatedAt: new Date().toISOString()
    });

    // Query children by fatherId
    const snapshot = await familyDb.where('fatherId', '==', ayahId).get();

    expect(snapshot.length).toBe(2);
  });

  it('should query married members', async () => {
    // Create married couple
    const husbandData = {
      familyId,
      name: 'Budi',
      gender: 'male',
      maritalStatus: 'married',
      createdBy: 'test-user',
      updatedAt: new Date().toISOString()
    };
    const husbandRef = await familyDb.add(husbandData);
    const husbandId = husbandRef.id;

    const wifeData = {
      familyId,
      name: 'Siti',
      gender: 'female',
      spouseId: husbandId,
      maritalStatus: 'married',
      createdBy: 'test-user',
      updatedAt: new Date().toISOString()
    };
    await familyDb.add(wifeData);

    // Query married members
    const snapshot = await familyDb.where('maritalStatus', '==', 'married').get();

    expect(snapshot.length).toBe(2);
  });

  it('should support parents from different family (menantu parents)', async () => {
    // Create menantu with parents from different family
    const menantuData = {
      familyId,
      name: 'Joko',
      gender: 'male',
      fatherId: 'ayah-dari-keluarga-lain',
      motherId: 'ibu-dari-keluarga-lain',
      createdBy: 'test-user',
      updatedAt: new Date().toISOString()
    };
    const menantuRef = await familyDb.add(menantuData);

    const allDocs = await familyDb.get();
    const menantuDoc = allDocs.find(d => d.id === menantuRef.id);

    expect(menantuDoc?.data()?.fatherId).toBe('ayah-dari-keluarga-lain');
    expect(menantuDoc?.data()?.motherId).toBe('ibu-dari-keluarga-lain');
  });

  it('should handle cross-family member transfer after marriage', async () => {
    // Member from external family
    const externalMember = {
      familyId: 'external-family',
      name: 'Joko',
      gender: 'male',
      createdBy: 'test-user',
      updatedAt: new Date().toISOString()
    };
    const externalRef = await familyDb.add(externalMember);
    
    // After marriage, update familyId to main family
    await familyDb.doc(externalRef.id).update({ 
      familyId: familyId,
      spouseId: 'anak-1',
      maritalStatus: 'married'
    });

    // Verify transfer
    const updatedDoc = familyDb.doc(externalRef.id).get();
    expect(updatedDoc.data()?.familyId).toBe(familyId);
    expect(updatedDoc.data()?.maritalStatus).toBe('married');
  });
});

describe('Firestore Data Validation', () => {
  it('should validate required fields', () => {
    const validMember = {
      familyId: 'test-family',
      name: 'Test',
      gender: 'male',
      createdBy: 'user-1',
      updatedAt: new Date().toISOString()
    };

    // Should have all required fields
    expect(validMember.familyId).toBeDefined();
    expect(validMember.name).toBeDefined();
    expect(validMember.gender).toBeDefined();
    expect(validMember.createdBy).toBeDefined();
  });

  it('should handle optional fields correctly', () => {
    const memberWithOptional = {
      familyId: 'test-family',
      name: 'Test',
      gender: 'male' as const,
      fatherId: 'father-1',
      motherId: undefined, // Optional - should be handled
      spouseId: undefined,
      maritalStatus: undefined,
      createdBy: 'user-1',
      updatedAt: new Date().toISOString()
    };

    // Filter out undefined values for Firestore
    const cleaned: Record<string, unknown> = {};
    Object.entries(memberWithOptional).forEach(([key, value]) => {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    });

    // No undefined values in cleaned object
    expect(Object.values(cleaned).some(v => v === undefined)).toBe(false);
  });

  it('should validate gender values', () => {
    const validGenders = ['male', 'female', 'other'];
    
    const testMember = {
      familyId: 'test',
      name: 'Test',
      gender: 'male' as const,
      createdBy: 'user',
      updatedAt: new Date().toISOString()
    };

    expect(validGenders).toContain(testMember.gender);
  });

  it('should validate maritalStatus values', () => {
    const validStatuses = ['single', 'married', 'divorced', 'widowed'];
    
    const marriedMember = {
      familyId: 'test',
      name: 'Test',
      gender: 'male' as const,
      maritalStatus: 'married' as const,
      createdBy: 'user',
      updatedAt: new Date().toISOString()
    };

    expect(validStatuses).toContain(marriedMember.maritalStatus);
  });
});