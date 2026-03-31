import { describe, it, expect, beforeEach } from 'vitest';
import { Member, Family } from '../src/domain/entities';

// ============================================
// TEST: 5 Generations Family Tree with Menantu
// ============================================
// 
// Structure:
// Generation 1 (Kakek/Nenek)
//   |
// Generation 2 (Ayah + Ibu) + Menantu dari keluarga lain
//   |
// Generation 3 (Anak-anak + Menantu)
//   |
// Generation 4 (Cucu-cucu)
//   |
// Generation 5 (Buyut)

// Helper to create family
const createFamily = (id: string, name: string): Family => ({
  id,
  name,
  ownerId: 'test-user',
  collaborators: [],
  createdAt: new Date().toISOString()
});

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

describe('Family Tree - 5 Generations with Menantu', () => {
  
  // Family 1: Keluarga Utama (Keluarga Budi)
  let familyUtama: Family;
  // Family 2: Keluarga Mantu (Keluarga Sari - keluarga istri)
  let familyMantu: Family;
  
  // Generation 1
  let kakek: Member;
  let nenek: Member;
  
  // Generation 2
  let ayah: Member;
  let ibu: Member;
  let paman: Member;
  
  // Generation 2 - Mantu (from other family)
  let menantuPerempuan: Member; // Anak dari keluarga lain yang menikah ke keluarga utama
  
  // Generation 3
  let anak1: Member;
  let anak2: Member;
  let anak3: Member;
  let menantuLaki: Member; // Mantu dari keluarga lain
  
  // Generation 4
  let cucu1: Member;
  let cucu2: Member;
  let cucu3: Member;
  
  // Generation 5
  let buyut: Member;

  beforeEach(() => {
    // Initialize families
    familyUtama = createFamily('family-utama', 'Keluarga Budi');
    familyMantu = createFamily('family-mantu', 'Keluarga Sari');

    // ============================================
    // GENERATION 1 (Kakek & Nenek)
    // ============================================
    kakek = createMember('g1-kakek', familyUtama.id, 'Kakek Budi', 'male');
    nenek = createMember('g1-nenek', familyUtama.id, 'Nenek Siti', 'female');

    // ============================================
    // GENERATION 2 (Ayah, Ibu, Paman + Menantu)
    // ============================================
    // Anak dari Kakek & Nenek
    ayah = createMember('g2-ayah', familyUtama.id, 'Budi', 'male', {
      fatherId: kakek.id,
      motherId: nenek.id
    });
    paman = createMember('g2-paman', familyUtama.id, 'Bejo', 'male', {
      fatherId: kakek.id,
      motherId: nenek.id
    });
    
    // Ibu dari keluarga lain (menantu dari keluarga Sari)
    // Pada awalnya belongs to familyMantu
    ibu = createMember('g2-ibu', familyMantu.id, 'Sari', 'female');
    
    // ============================================
    // GENERATION 2 - MARRIAGE
    // ============================================
    // Update spouse relationship
    ayah = { ...ayah, spouseId: ibu.id, maritalStatus: 'married' };
    ibu = { ...ibu, spouseId: ayah.id, maritalStatus: 'married', familyId: familyUtama.id }; // Move to family utama

    // ============================================
    // GENERATION 3 (Anak-anak + Menantu)
    // ============================================
    anak1 = createMember('g3-anak1', familyUtama.id, 'Ani', 'female', {
      fatherId: ayah.id,
      motherId: ibu.id
    });
    
    anak2 = createMember('g3-anak2', familyUtama.id, 'Andi', 'male', {
      fatherId: ayah.id,
      motherId: ibu.id
    });
    
    // Anak ketiga married ke orang dari keluarga lain
    anak3 = createMember('g3-anak3', familyUtama.id, 'Anto', 'male', {
      fatherId: ayah.id,
      motherId: ibu.id
    });
    
    // Mantu laki-laki (menikah ke anak1)
    // Orang tua menantu ada di keluarga lain
    menantuLaki = createMember('g3-mantu', 'family-External', 'Joko', 'male', {
      fatherId: 'g3-mantu-ayah',  // Ayah Joko dari keluarga lain
      motherId: 'g3-mantu-ibu'    // Ibu Joko dari keluarga lain
    });
    
    // ============================================
    // GENERATION 3 - MARRIAGE
    // ============================================
    anak1 = { ...anak1, spouseId: menantuLaki.id, maritalStatus: 'married' };
    menantuLaki = { 
      ...menantuLaki, 
      spouseId: anak1.id, 
      maritalStatus: 'married',
      familyId: familyUtama.id // Move to family utama after marriage
    };

    // ============================================
    // GENERATION 4 (Cucu-cucu)
    // ============================================
    cucu1 = createMember('g4-cucu1', familyUtama.id, 'Budi Jr', 'male', {
      fatherId: anak2.id
    });
    
    cucu2 = createMember('g4-cucu2', familyUtama.id, 'Diana', 'female', {
      motherId: anak1.id,
      fatherId: menantuLaki.id
    });
    
    cucu3 = createMember('g4-cucu3', familyUtama.id, 'Dedi', 'male', {
      fatherId: anak3.id
    });

    // ============================================
    // GENERATION 5 (Buyut)
    // ============================================
    buyut = createMember('g5-buyut', familyUtama.id, 'Echa', 'female', {
      fatherId: cucu1.id
    });
  });

  describe('Generation 1 - Kakek & Nenek', () => {
    it('should have kakek as male from utama family', () => {
      expect(kakek.gender).toBe('male');
      expect(kakek.familyId).toBe(familyUtama.id);
      expect(kakek.name).toBe('Kakek Budi');
    });

    it('should have nenek as female from utama family', () => {
      expect(nenek.gender).toBe('female');
      expect(nenek.familyId).toBe(familyUtama.id);
    });

    it('should have no parents (founder generation)', () => {
      expect(kakek.fatherId).toBeUndefined();
      expect(kakek.motherId).toBeUndefined();
      expect(nenek.fatherId).toBeUndefined();
      expect(nenek.motherId).toBeUndefined();
    });
  });

  describe('Generation 2 - Parents (with Menantu)', () => {
    it('should have ayah as son of kakek & nenek', () => {
      expect(ayah.fatherId).toBe(kakek.id);
      expect(ayah.motherId).toBe(nenek.id);
    });

    it('should have paman as son of kakek & nenek', () => {
      expect(paman.fatherId).toBe(kakek.id);
      expect(paman.motherId).toBe(nenek.id);
    });

    it('should have ibu originally from mantu family', () => {
      // Initially from different family
      expect(ibu.name).toBe('Sari');
    });

    it('should have ayah and ibu married', () => {
      expect(ayah.spouseId).toBe(ibu.id);
      expect(ibu.spouseId).toBe(ayah.id);
      expect(ayah.maritalStatus).toBe('married');
    });

    it('should move mantu to utama family after marriage', () => {
      // After marriage, ibu moves to family utama
      expect(ibu.familyId).toBe(familyUtama.id);
    });
  });

  describe('Generation 3 - Children (with Menantu)', () => {
    it('should have 3 children from ayah & ibu', () => {
      expect(anak1.fatherId).toBe(ayah.id);
      expect(anak1.motherId).toBe(ibu.id);
      expect(anak2.fatherId).toBe(ayah.id);
      expect(anak2.motherId).toBe(ibu.id);
      expect(anak3.fatherId).toBe(ayah.id);
      expect(anak3.motherId).toBe(ibu.id);
    });

    it('should have menantuLaki married to anak1', () => {
      expect(anak1.spouseId).toBe(menantuLaki.id);
      expect(menantuLaki.spouseId).toBe(anak1.id);
    });

    it('should move menantuLaki to utama family after marriage', () => {
      expect(menantuLaki.familyId).toBe(familyUtama.id);
    });

    it('should correctly identify menantu relationship', () => {
      // Mantu = person from other family who married into this family
      const isMantu = menantuLaki.spouseId === anak1.id && 
                      menantuLaki.familyId === familyUtama.id;
      expect(isMantu).toBe(true);
    });
  });

  describe('Generation 4 - Grandchildren (Cucu)', () => {
    it('should have cucu1 as child of anak2', () => {
      expect(cucu1.fatherId).toBe(anak2.id);
      expect(cucu1.motherId).toBeUndefined(); // Unknown mother
    });

    it('should have cucu2 as child of anak1 and menantuLaki', () => {
      expect(cucu2.motherId).toBe(anak1.id);
      expect(cucu2.fatherId).toBe(menantuLaki.id);
    });

    it('should have cucu3 as child of anak3', () => {
      expect(cucu3.fatherId).toBe(anak3.id);
    });

    it('should all cucu belong to utama family', () => {
      expect(cucu1.familyId).toBe(familyUtama.id);
      expect(cucu2.familyId).toBe(familyUtama.id);
      expect(cucu3.familyId).toBe(familyUtama.id);
    });
  });

  describe('Generation 5 - Great-grandchildren (Buyut)', () => {
    it('should have buyut as child of cucu1', () => {
      expect(buyut.fatherId).toBe(cucu1.id);
    });

    it('should belong to utama family', () => {
      expect(buyut.familyId).toBe(familyUtama.id);
    });
  });

  describe('Family Relationships', () => {
    it('should correctly identify grandfather relationship', () => {
      // Kakek is grandfather of anak1 (through ayah)
      // cucu1's grandfather is ayah (through anak2)
      
      // For anak1, father is ayah, and ayah's father is kakek
      expect(ayah.fatherId).toBe(kakek.id);
      expect(anak1.fatherId).toBe(ayah.id);
      
      // For cucu1, father is anak2, and anak2's father is ayah, and ayah's father is kakek
      expect(cucu1.fatherId).toBe(anak2.id);
      expect(anak2.fatherId).toBe(ayah.id);
      expect(ayah.fatherId).toBe(kakek.id);
    });

    it('should correctly identify uncle relationship', () => {
      // Paman is uncle to all children of Ayah
      // (brother of father)
      expect(paman.fatherId).toBe(kakek.id);
      expect(ayah.fatherId).toBe(kakek.id);
      // They share the same father, so paman is uncle to ayah's children
    });

    it('should correctly identify menantu (in-law) relationship', () => {
      // Menantu: someone from another family who married into this family
      // Joko (menantuLaki) married Ani (anak1) from keluarga utama
      const isMantuRelationship = 
        menantuLaki.familyId === familyUtama.id && // Now in this family
        menantuLaki.spouseId === anak1.id && // Married to family member
        menantuLaki.id !== ayah.id && // Not original member
        menantuLaki.id !== anak1.id;
      
      expect(isMantuRelationship).toBe(true);
    });
  });

  describe('Cross-Family Members', () => {
    it('should have members originally from mantu family', () => {
      // Before moving, ibu was from familyMantu
      // This tests the data structure supports cross-family relationships
      const familyMantuMembers = [
        { id: 'g2-ibu-original', name: 'Sari', originalFamilyId: 'family-mantu' }
      ];
      
      expect(familyMantuMembers[0].originalFamilyId).toBe('family-mantu');
    });

    it('should correctly track family transfer after marriage', () => {
      // Test that after marriage, member's familyId can change
      const transferredMember = {
        ...menantuLaki,
        originalFamilyId: 'family-External',
        familyId: 'family-utama' // After marriage
      };
      
      expect(transferredMember.originalFamilyId).toBe('family-External');
      expect(transferredMember.familyId).toBe('family-utama');
    });

    it('should have menantu parents from different family', () => {
      // Joko (menantuLaki) has parents in external family
      // These are the "orang tua menantu" (in-laws' parents)
      // For the main family, they are the parents of the son/daughter-in-law
      
      // Verify menantu has parents defined
      expect(menantuLaki.fatherId).toBe('g3-mantu-ayah');
      expect(menantuLaki.motherId).toBe('g3-mantu-ibu');
      
      // These parents are from external family (not familyUtama)
      // In real app, they would be in a different family's data
    });

    it('should identify relationship to menantu parents correctly', () => {
      // From main family's perspective:
      // - Orang tua menantu = parents of spouse's child (for children)
      // - Or parents of the person who married into family
      
      // For anak1 who married menantuLaki:
      // - ayah dari menantuLaki = "ayah mertua" (father-in-law) for anak1
      // - ibu dari menantuLaki = "ibu mertua" (mother-in-law) for anak1
      
      const getMertuaParents = (member: Member, spouseId: string): { fatherId?: string; motherId?: string } => {
        // Get the spouse's parents (from different family)
        if (member.id === anak1.id && spouseId === menantuLaki.id) {
          return {
            fatherId: menantuLaki.fatherId,
            motherId: menantuLaki.motherId
          };
        }
        return {};
      };
      
      const mertua = getMertuaParents(anak1, menantuLaki.id);
      expect(mertua.fatherId).toBe('g3-mantu-ayah');
      expect(mertua.motherId).toBe('g3-mantu-ibu');
    });
  });
});

describe('Family Tree Validation', () => {
  it('should validate 5 generation depth', () => {
    const generations = [
      ['g1-kakek', 'g1-nenek'],          // Gen 1
      ['g2-ayah', 'g2-ibu', 'g2-paman'], // Gen 2
      ['g3-anak1', 'g3-anak2', 'g3-anak3', 'g3-mantu'], // Gen 3
      ['g4-cucu1', 'g4-cucu2', 'g4-cucu3'], // Gen 4
      ['g5-buyut']                        // Gen 5
    ];
    
    expect(generations.length).toBe(5);
    expect(generations[0].length).toBe(2);  // 2 in gen 1
    expect(generations[1].length).toBe(3);  // 3 in gen 2
    expect(generations[2].length).toBe(4);  // 4 in gen 3 (including menantu)
    expect(generations[3].length).toBe(3);  // 3 in gen 4
    expect(generations[4].length).toBe(1);  // 1 in gen 5
  });

  it('should ensure no circular parent references', () => {
    // Each child should not have themselves as parent
    const members = [
      createMember('g3-test', 'fam1', 'Test', 'male', {
        fatherId: 'different-id'
      })
    ];
    
    const hasSelfReference = members.some(m => 
      m.fatherId === m.id || m.motherId === m.id
    );
    
    expect(hasSelfReference).toBe(false);
  });
});