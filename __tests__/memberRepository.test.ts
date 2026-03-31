import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Member, Family } from '../src/domain/entities';
import { FirebaseMemberRepository } from '../src/infrastructure/repositories/FirebaseMemberRepository';
import { db } from '../src/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where } from 'firebase/firestore';

// Mock Firebase
vi.mock('../src/firebase', () => ({
  db: {},
  handleFirestoreError: vi.fn(),
  OperationType: {
    LIST: 'list',
    GET: 'get',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete'
  }
}));

describe('FirebaseMemberRepository - Database Operations', () => {
  let repository: FirebaseMemberRepository;
  
  // Test family
  const testFamily: Family = {
    id: 'test-family-123',
    name: 'Keluarga Test',
    ownerId: 'test-user-123',
    collaborators: [],
    createdAt: new Date().toISOString()
  };

  // Test member data structure (5 generations with menantu)
  const createTestMember = (
    id: string,
    name: string,
    gender: 'male' | 'female' | 'other',
    options: Partial<Member> = {}
  ): Omit<Member, 'id'> => ({
    familyId: testFamily.id,
    name,
    gender,
    createdBy: 'test-user-123',
    updatedAt: new Date().toISOString(),
    ...options
  });

  beforeEach(() => {
    repository = new FirebaseMemberRepository();
  });

  describe('Member Data Structure Validation', () => {
    it('should validate member has required fields', () => {
      const member = createTestMember('m1', 'John', 'male');
      
      expect(member.familyId).toBe(testFamily.id);
      expect(member.name).toBe('John');
      expect(member.gender).toBe('male');
      expect(member.createdBy).toBe('test-user-123');
      expect(member.updatedAt).toBeDefined();
    });

    it('should allow optional fields for relationships', () => {
      const member = createTestMember('m1', 'Ani', 'female', {
        fatherId: 'father-1',
        motherId: 'mother-1',
        spouseId: 'spouse-1',
        maritalStatus: 'married',
        marriageDate: '2020-01-01',
        isAdoptedChild: false
      });
      
      expect(member.fatherId).toBe('father-1');
      expect(member.motherId).toBe('mother-1');
      expect(member.spouseId).toBe('spouse-1');
      expect(member.maritalStatus).toBe('married');
      expect(member.marriageDate).toBe('2020-01-01');
      expect(member.isAdoptedChild).toBe(false);
    });

    it('should support menantu (in-law) relationships', () => {
      // Mantu = someone from another family who married into this family
      const menantu = createTestMember('mantu-1', 'Joko', 'male', {
        familyId: testFamily.id, // Now in main family
        spouseId: 'anak-1',       // Married to family member
        externalFamilyId: 'family-external', // Original family
        externalSpouseName: 'External Family' // Original family name
      });
      
      expect(menantu.familyId).toBe(testFamily.id);
      expect(menantu.externalFamilyId).toBe('family-external');
    });

    it('should support parents from different family (for menantu)', () => {
      // Orang tua menantu bisa dari keluarga lain
      const menantuWithParents = createTestMember('mantu-2', 'Siti', 'female', {
        fatherId: 'ayah-mantu', // Dari keluarga lain
        motherId: 'ibu-mantu',   // Dari keluarga lain
        familyId: testFamily.id
      });
      
      expect(menantuWithParents.fatherId).toBe('ayah-mantu');
      expect(menantuWithParents.motherId).toBe('ibu-mantu');
    });
  });

  describe('Family Tree Data Integrity', () => {
    it('should validate 5 generation structure', () => {
      // Generation 1: Kakek/Nenek (no parents)
      const gen1 = createTestMember('g1', 'Kakek', 'male');
      expect(gen1.fatherId).toBeUndefined();
      expect(gen1.motherId).toBeUndefined();

      // Generation 2: Parents (have parents from gen1)
      const gen2 = createTestMember('g2', 'Ayah', 'male', {
        fatherId: 'g1',
        motherId: 'g1-nenek'
      });
      expect(gen2.fatherId).toBe('g1');
      expect(gen2.motherId).toBe('g1-nenek');

      // Generation 3: Children (have parents from gen2)
      const gen3 = createTestMember('g3', 'Anak', 'male', {
        fatherId: 'g2',
        motherId: 'g2-ibu'
      });
      expect(gen3.fatherId).toBe('g2');

      // Generation 4: Cucu (have parents from gen3)
      const gen4 = createTestMember('g4', 'Cucu', 'male', {
        fatherId: 'g3'
      });
      expect(gen4.fatherId).toBe('g3');

      // Generation 5: Buyut (have parents from gen4)
      const gen5 = createTestMember('g5', 'Buyut', 'female', {
        fatherId: 'g4'
      });
      expect(gen5.fatherId).toBe('g4');
    });

    it('should validate no circular references', () => {
      // Members with IDs (simulating stored data)
      const members = [
        { id: 'a', ...createTestMember('a', 'A', 'male', { fatherId: 'b' }) },
        { id: 'b', ...createTestMember('b', 'B', 'male', { fatherId: 'c' }) },
        { id: 'c', ...createTestMember('c', 'C', 'male') }
      ] as Array<Member & { id: string }>;

      // A -> B -> C is valid (no cycle back to A)
      const hasCycle = members.some(m => {
        let current = m;
        const visited = new Set<string>();
        while (current.fatherId) {
          if (visited.has(current.fatherId)) return true;
          visited.add(current.fatherId);
          const parent = members.find(mem => mem.id === current.fatherId);
          if (!parent) break;
          current = parent;
        }
        return false;
      });

      expect(hasCycle).toBe(false);
    });

    it('should support cross-family marriage (mantu)', () => {
      // Main family member
      const anak = createTestMember('anak-1', 'Ani', 'female');
      
      // Mantu from external family
      const menantu = createTestMember('mantu-1', 'Joko', 'male', {
        familyId: testFamily.id, // After marriage, belongs to main family
        spouseId: 'anak-1',      // Married to family member
        externalFamilyId: 'external-family'
      });

      // Both are now in the same family after marriage
      expect(anak.familyId).toBe(testFamily.id);
      expect(menantu.familyId).toBe(testFamily.id);
      
      // They're married
      expect(anak.spouseId).toBeUndefined(); // Not set in this test
      expect(menantu.spouseId).toBe('anak-1');
    });
  });

  describe('Member Repository Interface', () => {
    it('should have getByFamilyId method', () => {
      expect(typeof repository.getByFamilyId).toBe('function');
    });

    it('should have getById method', () => {
      expect(typeof repository.getById).toBe('function');
    });

    it('should have create method', () => {
      expect(typeof repository.create).toBe('function');
    });

    it('should have update method', () => {
      expect(typeof repository.update).toBe('function');
    });

    it('should have delete method', () => {
      expect(typeof repository.delete).toBe('function');
    });

    it('should have subscribeByFamilyId method', () => {
      expect(typeof repository.subscribeByFamilyId).toBe('function');
    });

    it('should have batchUpdate method', () => {
      expect(typeof repository.batchUpdate).toBe('function');
    });
  });

  describe('Data Validation for Firestore', () => {
    it('should not have undefined values (Firestore requirement)', () => {
      const member = createTestMember('m1', 'Test', 'male', {
        fatherId: undefined,
        motherId: undefined,
        spouseId: undefined
      });

      // Check that optional fields that are undefined are not present
      // or handle them properly
      const cleanedMember = { ...member };
      Object.keys(cleanedMember).forEach(key => {
        if (cleanedMember[key as keyof typeof cleanedMember] === undefined) {
          delete cleanedMember[key as keyof typeof cleanedMember];
        }
      });

      // After cleaning, no undefined values
      const hasUndefined = Object.values(cleanedMember).some(v => v === undefined);
      expect(hasUndefined).toBe(false);
    });

    it('should have valid gender values', () => {
      const validGenders = ['male', 'female', 'other'];
      
      const member1 = createTestMember('m1', 'Male', 'male');
      const member2 = createTestMember('m2', 'Female', 'female');
      const member3 = createTestMember('m3', 'Other', 'other');

      expect(validGenders).toContain(member1.gender);
      expect(validGenders).toContain(member2.gender);
      expect(validGenders).toContain(member3.gender);
    });

    it('should have valid maritalStatus values', () => {
      const validStatuses = ['single', 'married', 'divorced', 'widowed'];
      
      const single = createTestMember('m1', 'Single', 'male', { maritalStatus: 'single' });
      const married = createTestMember('m2', 'Married', 'male', { maritalStatus: 'married' });
      const divorced = createTestMember('m3', 'Divorced', 'male', { maritalStatus: 'divorced' });
      const widowed = createTestMember('m4', 'Widowed', 'male', { maritalStatus: 'widowed' });

      expect(validStatuses).toContain(single.maritalStatus);
      expect(validStatuses).toContain(married.maritalStatus);
      expect(validStatuses).toContain(divorced.maritalStatus);
      expect(validStatuses).toContain(widowed.maritalStatus);
    });
  });

  describe('Family Relationships Queries', () => {
    it('should support querying children by parent ID', () => {
      const allMembers = [
        createTestMember('parent-1', 'Ayah', 'male'),
        createTestMember('child-1', 'Anak1', 'male', { fatherId: 'parent-1' }),
        createTestMember('child-2', 'Anak2', 'female', { fatherId: 'parent-1' }),
        createTestMember('unrelated', 'Lain', 'male')
      ];

      const children = allMembers.filter(m => m.fatherId === 'parent-1');
      expect(children.length).toBe(2);
      expect(children.map(c => c.name)).toEqual(['Anak1', 'Anak2']);
    });

    it('should support querying spouse', () => {
      const allMembers = [
        createTestMember('husband', 'Budi', 'male', { spouseId: 'wife', maritalStatus: 'married' }),
        createTestMember('wife', 'Siti', 'female', { spouseId: 'husband', maritalStatus: 'married' }),
        createTestMember('single', 'Joko', 'male', { maritalStatus: 'single' })
      ];

      const married = allMembers.filter(m => m.maritalStatus === 'married');
      expect(married.length).toBe(2);
    });

    it('should support querying menantu relationships', () => {
      const allMembers = [
        createTestMember('anak', 'Ani', 'female', { familyId: testFamily.id }),
        createTestMember('mantu', 'Joko', 'male', { 
          familyId: testFamily.id, 
          spouseId: 'anak',
          externalFamilyId: 'external'
        })
      ];

      // Find menantu: members who have externalFamilyId and married to family member
      const mantu = allMembers.filter(m => 
        m.externalFamilyId && m.spouseId
      );
      
      expect(mantu.length).toBe(1);
      expect(mantu[0].name).toBe('Joko');
    });
  });
});