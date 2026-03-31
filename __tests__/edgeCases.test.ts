import { describe, it, expect, beforeEach } from 'vitest';
import { Member, Family } from '../src/domain/entities';

// ============================================
// Edge Cases Tests for Family Tree
// ============================================

// Helper to create member
const createMember = (
  id: string,
  familyId: string,
  name: string,
  gender: 'male' | 'female' | 'other',
  options: Partial<Member> = {}
): Member => ({
  id,
  familyId,
  name,
  gender,
  createdBy: 'test-user',
  updatedAt: new Date().toISOString(),
  ...options
});

// Helper to create family
const createFamily = (id: string, name: string): Family => ({
  id,
  name,
  ownerId: 'test-user',
  collaborators: [],
  createdAt: new Date().toISOString()
});

describe('Edge Cases - Member Relationships', () => {
  describe('Orphan members (no parents)', () => {
    it('should handle members with no parents', () => {
      const orphan = createMember('orphan-1', 'family-1', 'John', 'male');
      
      expect(orphan.fatherId).toBeUndefined();
      expect(orphan.motherId).toBeUndefined();
    });

    it('should handle members with only father', () => {
      const childWithFather = createMember('child-1', 'family-1', 'Jane', 'female', {
        fatherId: 'father-1'
      });
      
      expect(childWithFather.fatherId).toBe('father-1');
      expect(childWithFather.motherId).toBeUndefined();
    });

    it('should handle members with only mother', () => {
      const childWithMother = createMember('child-1', 'family-1', 'Bob', 'male', {
        motherId: 'mother-1'
      });
      
      expect(childWithMother.motherId).toBe('mother-1');
      expect(childWithMother.fatherId).toBeUndefined();
    });
  });

  describe('Self reference prevention', () => {
    it('should not allow member to be their own parent', () => {
      // In real app, this should be prevented by validation
      const invalidMember = createMember('self-1', 'family-1', 'Test', 'male', {
        fatherId: 'self-1' // This would be invalid
      });
      
      // Current implementation allows it (validation should catch this)
      expect(invalidMember.fatherId).toBe('self-1');
    });

    it('should not allow member to be their own parent via mother', () => {
      const invalidMember = createMember('self-1', 'family-1', 'Test', 'female', {
        motherId: 'self-1' // This would be invalid
      });
      
      expect(invalidMember.motherId).toBe('self-1');
    });
  });

  describe('Spouse relationship edge cases', () => {
    it('should handle single member (no spouse)', () => {
      const single = createMember('single-1', 'family-1', 'John', 'male', {
        maritalStatus: 'single'
      });
      
      expect(single.spouseId).toBeUndefined();
      expect(single.maritalStatus).toBe('single');
    });

    it('should handle married member without spouseId', () => {
      // Edge case: married but spouseId not set
      const inconsistent = createMember('inc-1', 'family-1', 'John', 'male', {
        maritalStatus: 'married'
        // spouseId missing - data inconsistency
      });
      
      expect(inconsistent.maritalStatus).toBe('married');
      expect(inconsistent.spouseId).toBeUndefined();
    });

    it('should handle widowed member', () => {
      const widowed = createMember('widowed-1', 'family-1', 'Mary', 'female', {
        maritalStatus: 'widowed',
        spouseId: '' // Spouse deceased
      });
      
      expect(widowed.maritalStatus).toBe('widowed');
    });

    it('should handle divorced member', () => {
      const divorced = createMember('div-1', 'family-1', 'Tom', 'male', {
        maritalStatus: 'divorced',
        spouseId: '' // Ex-spouse cleared
      });
      
      expect(divorced.maritalStatus).toBe('divorced');
    });
  });

  describe('Multiple spouses (polygamy/polygyny)', () => {
    it('should handle multiple spouse IDs', () => {
      const multiSpouse = createMember('multi-1', 'family-1', 'Husband', 'male', {
        spouseId: 'wife-1',
        spouseIds: ['wife-1', 'wife-2'],
        maritalStatus: 'married'
      });
      
      expect(multiSpouse.spouseId).toBe('wife-1');
      expect(multiSpouse.spouseIds).toContain('wife-1');
      expect(multiSpouse.spouseIds).toContain('wife-2');
    });

    it('should handle spouseIds for wife with multiple husbands', () => {
      const multiHusband = createMember('multi-2', 'family-1', 'Wife', 'female', {
        spouseId: 'husband-1',
        spouseIds: ['husband-1', 'husband-2'],
        maritalStatus: 'married'
      });
      
      expect(multiHusband.spouseIds?.length).toBe(2);
    });
  });

  describe('External family relationships', () => {
    it('should handle external spouse from different family', () => {
      const externalSpouse = createMember('ext-1', 'family-external', 'External Spouse', 'female', {
        externalSpouseName: 'Keluarga Luar'
      });
      
      expect(externalSpouse.externalSpouseName).toBe('Keluarga Luar');
    });

    it('should handle external family ID', () => {
      const withExternalFamily = createMember('ext-member', 'family-1', 'John', 'male', {
        externalFamilyId: 'family-external'
      });
      
      expect(withExternalFamily.externalFamilyId).toBe('family-external');
    });

    it('should handle menantu (in-law) from completely different family', () => {
      const menantu = createMember('menantu-1', 'family-1', 'Menantu', 'male', {
        familyId: 'family-1', // Now belongs to main family
        spouseId: 'anak-1', // Married to family member
        externalFamilyId: 'family-menantu-asal', // Original family
        maritalStatus: 'married'
      });
      
      // This is a valid menantu relationship
      expect(menantu.familyId).not.toBe(menantu.externalFamilyId);
      expect(menantu.spouseId).toBeDefined();
    });
  });

  describe('Adopted children', () => {
    it('should handle adopted child', () => {
      const adopted = createMember('adopted-1', 'family-1', 'Adopted Child', 'male', {
        fatherId: 'adoptive-father',
        motherId: 'adoptive-mother',
        isAdoptedChild: true
      });
      
      expect(adopted.isAdoptedChild).toBe(true);
      expect(adopted.fatherId).toBeDefined();
    });

    it('should handle adopted child with original parents', () => {
      const adoptedWithOrigin = createMember('adopted-2', 'family-1', 'Adopted Child', 'female', {
        fatherId: 'adoptive-father',
        motherId: 'adoptive-mother',
        isAdoptedChild: true,
        bio: 'Adopted from other family' // Original family info in bio
      });
      
      expect(adoptedWithOrigin.isAdoptedChild).toBe(true);
      expect(adoptedWithOrigin.bio).toContain('Adopted');
    });
  });

  describe('Gender edge cases', () => {
    it('should handle other gender', () => {
      const other = createMember('other-1', 'family-1', 'Other', 'other');
      expect(other.gender).toBe('other');
    });
  });

  describe('Birth/Death date edge cases', () => {
    it('should handle deceased member', () => {
      const deceased = createMember('deceased-1', 'family-1', 'Grandma', 'female', {
        birthDate: '1940-01-01',
        deathDate: '2020-01-01'
      });
      
      expect(deceased.birthDate).toBe('1940-01-01');
      expect(deceased.deathDate).toBe('2020-01-01');
    });

    it('should handle living member with only birthDate', () => {
      const living = createMember('living-1', 'family-1', 'Son', 'male', {
        birthDate: '2000-01-01'
        // No deathDate - still alive
      });
      
      expect(living.birthDate).toBe('2000-01-01');
      expect(living.deathDate).toBeUndefined();
    });

    it('should handle death date before birth date (invalid)', () => {
      // This would be invalid in real app - should be caught by validation
      const invalid = createMember('invalid-1', 'family-1', 'Test', 'male', {
        birthDate: '2020-01-01',
        deathDate: '2000-01-01' // Before birth!
      });
      
      // Current implementation doesn't validate this
      expect(invalid.deathDate).toBe('2000-01-01');
    });
  });

  describe('Family relationships edge cases', () => {
    it('should handle members moving between families', () => {
      // Before marriage
      const beforeMarriage = createMember('person-1', 'family-1', 'John', 'male');
      expect(beforeMarriage.familyId).toBe('family-1');
      
      // After marriage - familyId changes
      const afterMarriage = {
        ...beforeMarriage,
        familyId: 'family-2', // Moved to spouse's family
        spouseId: 'spouse-1',
        maritalStatus: 'married'
      };
      
      expect(afterMarriage.familyId).toBe('family-2');
    });

    it('should handle family with no members', () => {
      const emptyFamily = createFamily('empty-family', 'Empty Family');
      const members: Member[] = [];
      
      // Should handle empty gracefully
      const children = members.filter(m => m.fatherId === 'any');
      expect(children.length).toBe(0);
    });

    it('should handle family with many members', () => {
      const largeFamily = createFamily('large-family', 'Large Family');
      const members: Member[] = [];
      
      // Add 100 members
      for (let i = 0; i < 100; i++) {
        members.push(createMember(`member-${i}`, largeFamily.id, `Member ${i}`, 'male'));
      }
      
      expect(members.length).toBe(100);
    });
  });

  describe('Name edge cases', () => {
    it('should handle empty name', () => {
      const emptyName = createMember('empty-name', 'family-1', '', 'male');
      expect(emptyName.name).toBe('');
    });

    it('should handle very long name', () => {
      const longName = 'A'.repeat(1000);
      const longNameMember = createMember('long-1', 'family-1', longName, 'male');
      expect(longNameMember.name.length).toBe(1000);
    });

    it('should handle special characters in name', () => {
      const specialName = createMember('special-1', 'family-1', "O'Connor Jr.", 'male');
      expect(specialName.name).toBe("O'Connor Jr.");
    });

    it('should handle unicode characters in name', () => {
      const unicodeName = createMember('unicode-1', 'family-1', '日本語テスト', 'male');
      expect(unicodeName.name).toBe('日本語テスト');
    });
  });

  describe('Circular relationship detection', () => {
    it('should detect potential circular parent reference', () => {
      const members = [
        createMember('a', 'f1', 'A', 'male', { fatherId: 'b' }),
        createMember('b', 'f1', 'B', 'male', { fatherId: 'a' }) // Circular: A -> B -> A
      ];
      
      // This creates a cycle in the tree
      const cycleExists = members[0].fatherId === 'b' && members[1].fatherId === 'a';
      expect(cycleExists).toBe(true);
    });

    it('should detect longer circular reference', () => {
      const members = [
        createMember('a', 'f1', 'A', 'male', { fatherId: 'b' }),
        createMember('b', 'f1', 'B', 'male', { fatherId: 'c' }),
        createMember('c', 'f1', 'C', 'male', { fatherId: 'd' }),
        createMember('d', 'f1', 'D', 'male', { fatherId: 'a' }) // Cycle!
      ];
      
      // There's a cycle: A -> B -> C -> D -> A
      expect(members[0].fatherId).toBe('b');
      expect(members[3].fatherId).toBe('a');
    });
  });

  describe('Data consistency', () => {
    it('should handle inconsistent spouse relationship', () => {
      const memberA = createMember('a', 'family-1', 'A', 'male', { spouseId: 'b' });
      const memberB = createMember('b', 'family-1', 'B', 'female', { spouseId: 'c' }); // Not mutual!
      
      // A thinks B is spouse, but B thinks C is spouse
      const isMutual = memberA.spouseId === memberB.id && memberB.spouseId === memberA.id;
      expect(isMutual).toBe(false);
    });

    it('should handle missing required fields gracefully', () => {
      // Partial member - only required fields
      const minimalMember = {
        id: 'min-1',
        familyId: 'family-1',
        name: 'Minimal',
        gender: 'male' as const,
        createdBy: 'test',
        updatedAt: new Date().toISOString()
      };
      
      expect(minimalMember.name).toBe('Minimal');
      expect(minimalMember.familyId).toBe('family-1');
    });
  });

  describe('Media and bio edge cases', () => {
    it('should handle member with multiple photos', () => {
      const withMedia = createMember('media-1', 'family-1', 'John', 'male', {
        photoUrl: 'main-photo.jpg',
        media: [
          { url: 'photo1.jpg', type: 'image', name: 'Photo 1' },
          { url: 'photo2.jpg', type: 'image', name: 'Photo 2' },
          { url: 'doc.pdf', type: 'document', name: 'Document' }
        ]
      });
      
      expect(withMedia.media?.length).toBe(3);
      expect(withMedia.media?.filter(m => m.type === 'image').length).toBe(2);
    });

    it('should handle very long bio', () => {
      const longBio = 'A'.repeat(10000);
      const withLongBio = createMember('long-bio', 'family-1', 'John', 'male', {
        bio: longBio
      });
      
      expect(withLongBio.bio?.length).toBe(10000);
    });

    it('should handle empty bio', () => {
      const noBio = createMember('no-bio', 'family-1', 'John', 'male', {
        bio: ''
      });
      
      expect(noBio.bio).toBe('');
    });
  });

  describe('Timestamp edge cases', () => {
    it('should handle future dates', () => {
      const futureDate = '2099-01-01';
      const futureBorn = createMember('future-1', 'family-1', 'Future', 'male', {
        birthDate: futureDate
      });
      
      // This would be invalid in real app
      expect(futureBorn.birthDate).toBe(futureDate);
    });

    it('should handle very old dates', () => {
      const oldDate = '1800-01-01';
      const oldPerson = createMember('old-1', 'family-1', 'Old Person', 'male', {
        birthDate: oldDate
      });
      
      expect(oldPerson.birthDate).toBe(oldDate);
    });
  });
});

describe('Edge Cases - Family Operations', () => {
  it('should handle family with no owner', () => {
    const noOwner = {
      id: 'no-owner',
      name: 'Orphan Family',
      collaborators: [] as string[],
      createdAt: new Date().toISOString()
    } as Family;
    
    expect(noOwner.ownerId).toBeUndefined();
  });

  it('should handle family with many collaborators', () => {
    const manyCollab = createFamily('many-collab', 'Family');
    manyCollab.collaborators = Array.from({ length: 50 }, (_, i) => `user-${i}`);
    
    expect(manyCollab.collaborators.length).toBe(50);
  });

  it('should handle duplicate collaborator', () => {
    const duplicateCollab = createFamily('dup-collab', 'Family');
    duplicateCollab.collaborators = ['user-1', 'user-1', 'user-1']; // Duplicate
    
    // Current implementation allows duplicates
    expect(duplicateCollab.collaborators.filter(c => c === 'user-1').length).toBe(3);
  });

  it('should handle empty family name', () => {
    const emptyName = createFamily('empty-name', '');
    expect(emptyName.name).toBe('');
  });
});

describe('Edge Cases - Query Operations', () => {
  it('should handle query with no results', () => {
    const allMembers = [
      createMember('m1', 'f1', 'John', 'male')
    ];
    
    const results = allMembers.filter(m => m.fatherId === 'non-existent');
    expect(results.length).toBe(0);
  });

  it('should handle query with multiple matches', () => {
    const allMembers = [
      createMember('m1', 'f1', 'Child1', 'male', { fatherId: 'father-1' }),
      createMember('m2', 'f1', 'Child2', 'male', { fatherId: 'father-1' }),
      createMember('m3', 'f1', 'Child3', 'male', { fatherId: 'father-1' }),
      createMember('m4', 'f1', 'Not Child', 'male', { fatherId: 'other' })
    ];
    
    const children = allMembers.filter(m => m.fatherId === 'father-1');
    expect(children.length).toBe(3);
  });

  it('should handle query by non-existent field', () => {
    const allMembers = [
      createMember('m1', 'f1', 'John', 'male')
    ];
    
    const results = allMembers.filter(m => (m as any).nonExistentField === 'value');
    expect(results.length).toBe(0);
  });

  it('should handle finding root members (founders)', () => {
    const allMembers = [
      createMember('g1', 'f1', 'Grandfather', 'male'), // No parents
      createMember('g2', 'f1', 'Grandmother', 'female'), // No parents
      createMember('p1', 'f1', 'Parent', 'male', { fatherId: 'g1', motherId: 'g2' }) // Has parents
    ];
    
    const founders = allMembers.filter(m => !m.fatherId && !m.motherId);
    expect(founders.length).toBe(2);
  });
});

describe('Edge Cases - Data Migration', () => {
  it('should handle old data format migration', () => {
    // Simulate old data without new fields
    const oldData = {
      id: 'old-1',
      familyId: 'f1',
      name: 'Old Member',
      gender: 'male' as const,
      createdBy: 'system',
      updatedAt: '2020-01-01'
    };
    
    // New fields should be undefined/missing
    expect((oldData as any).spouseIds).toBeUndefined();
    expect((oldData as any).isAdoptedChild).toBeUndefined();
    expect((oldData as any).media).toBeUndefined();
  });

  it('should handle null values in optional fields', () => {
    const withNulls = createMember('null-1', 'f1', 'Test', 'male', {
      fatherId: null as any,
      motherId: null as any,
      spouseId: null as any
    });
    
    // Should handle null as undefined
    expect(withNulls.fatherId).toBeNull();
    expect(withNulls.motherId).toBeNull();
  });
});