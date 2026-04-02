/**
 * Comprehensive Member Validation Tests
 * Tests all validation schemas with various edge cases
 */

import { describe, it, expect } from 'vitest';
import {
  GenderSchema,
  MaritalStatusSchema,
  MemberNameSchema,
  BirthDateSchema,
  DeathDateSchema,
  MarriageDateSchema,
  BioSchema,
  PhotoUrlSchema,
  CreateMemberSchema,
  UpdateMemberSchema,
  DeleteMemberSchema,
  SetParentsSchema,
  SetSpouseSchema,
  RemoveSpouseSchema
} from '../../src/domain/validation/MemberValidation';

describe('Comprehensive Member Validation Tests', () => {
  describe('GenderSchema', () => {
    it('should accept valid male gender', () => {
      const result = GenderSchema.safeParse('male');
      expect(result.success).toBe(true);
    });

    it('should accept valid female gender', () => {
      const result = GenderSchema.safeParse('female');
      expect(result.success).toBe(true);
    });

    it('should accept valid other gender', () => {
      const result = GenderSchema.safeParse('other');
      expect(result.success).toBe(true);
    });

    it('should reject invalid gender with capital letter', () => {
      const result = GenderSchema.safeParse('Male');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Gender must be male, female, or other');
      }
    });

    it('should reject completely invalid gender', () => {
      const result = GenderSchema.safeParse('invalid');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Gender must be male, female, or other');
      }
    });

    it('should reject empty string', () => {
      const result = GenderSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject number', () => {
      const result = GenderSchema.safeParse(123);
      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = GenderSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should reject undefined', () => {
      const result = GenderSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });
  });

  describe('MaritalStatusSchema', () => {
    it('should accept single status', () => {
      const result = MaritalStatusSchema.safeParse('single');
      expect(result.success).toBe(true);
    });

    it('should accept married status', () => {
      const result = MaritalStatusSchema.safeParse('married');
      expect(result.success).toBe(true);
    });

    it('should accept divorced status', () => {
      const result = MaritalStatusSchema.safeParse('divorced');
      expect(result.success).toBe(true);
    });

    it('should accept widowed status', () => {
      const result = MaritalStatusSchema.safeParse('widowed');
      expect(result.success).toBe(true);
    });

    it('should reject invalid status with capital letter', () => {
      const result = MaritalStatusSchema.safeParse('Single');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Marital status must be single, married, divorced, or widowed');
      }
    });

    it('should reject completely invalid status', () => {
      const result = MaritalStatusSchema.safeParse('complicated');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Marital status must be single, married, divorced, or widowed');
      }
    });

    it('should reject empty string', () => {
      const result = MaritalStatusSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('MemberNameSchema', () => {
    it('should accept valid name', () => {
      const result = MemberNameSchema.safeParse('John Doe');
      expect(result.success).toBe(true);
    });

    it('should accept name with minimum length', () => {
      const result = MemberNameSchema.safeParse('J');
      expect(result.success).toBe(true);
    });

    it('should accept name with maximum length', () => {
      const longName = 'A'.repeat(100);
      const result = MemberNameSchema.safeParse(longName);
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = MemberNameSchema.safeParse('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Member name is required');
      }
    });

    it('should reject name exceeding maximum length', () => {
      const longName = 'A'.repeat(101);
      const result = MemberNameSchema.safeParse(longName);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Member name must be 100 characters or less');
      }
    });

    it('should reject whitespace-only name', () => {
      const result = MemberNameSchema.safeParse('   ');
      expect(result.success).toBe(false);
    });

    it('should reject number', () => {
      const result = MemberNameSchema.safeParse(123);
      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = MemberNameSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should reject undefined', () => {
      const result = MemberNameSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });
  });

  describe('BirthDateSchema', () => {
    it('should accept valid date format', () => {
      const result = BirthDateSchema.safeParse('1990-01-15');
      expect(result.success).toBe(true);
    });

    it('should accept valid date with different format', () => {
      const result = BirthDateSchema.safeParse('2000-12-31');
      expect(result.success).toBe(true);
    });

    it('should accept undefined (optional)', () => {
      const result = BirthDateSchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const result = BirthDateSchema.safeParse('01/15/1990');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Birth date must be in YYYY-MM-DD format');
      }
    });

    it('should reject invalid date value', () => {
      const result = BirthDateSchema.safeParse('1990-13-45');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid birth date');
      }
    });

    it('should reject empty string', () => {
      const result = BirthDateSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject number', () => {
      const result = BirthDateSchema.safeParse(123);
      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = BirthDateSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });

  describe('DeathDateSchema', () => {
    it('should accept valid date format', () => {
      const result = DeathDateSchema.safeParse('2020-05-10');
      expect(result.success).toBe(true);
    });

    it('should accept undefined (optional)', () => {
      const result = DeathDateSchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const result = DeathDateSchema.safeParse('05/10/2020');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Death date must be in YYYY-MM-DD format');
      }
    });

    it('should reject invalid date value', () => {
      const result = DeathDateSchema.safeParse('2020-13-45');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid death date');
      }
    });
  });

  describe('MarriageDateSchema', () => {
    it('should accept valid date format', () => {
      const result = MarriageDateSchema.safeParse('2015-06-20');
      expect(result.success).toBe(true);
    });

    it('should accept undefined (optional)', () => {
      const result = MarriageDateSchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const result = MarriageDateSchema.safeParse('06/20/2015');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Marriage date must be in YYYY-MM-DD format');
      }
    });

    it('should reject invalid date value', () => {
      const result = MarriageDateSchema.safeParse('2015-13-45');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid marriage date');
      }
    });
  });

  describe('BioSchema', () => {
    it('should accept valid bio', () => {
      const result = BioSchema.safeParse('This is a bio');
      expect(result.success).toBe(true);
    });

    it('should accept bio with maximum length', () => {
      const longBio = 'A'.repeat(1000);
      const result = BioSchema.safeParse(longBio);
      expect(result.success).toBe(true);
    });

    it('should accept undefined (optional)', () => {
      const result = BioSchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it('should accept empty string', () => {
      const result = BioSchema.safeParse('');
      expect(result.success).toBe(true);
    });

    it('should reject bio exceeding maximum length', () => {
      const longBio = 'A'.repeat(1001);
      const result = BioSchema.safeParse(longBio);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Bio must be 1000 characters or less');
      }
    });

    it('should reject number', () => {
      const result = BioSchema.safeParse(123);
      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = BioSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });

  describe('PhotoUrlSchema', () => {
    it('should accept valid URL', () => {
      const result = PhotoUrlSchema.safeParse('https://example.com/photo.jpg');
      expect(result.success).toBe(true);
    });

    it('should accept undefined (optional)', () => {
      const result = PhotoUrlSchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL', () => {
      const result = PhotoUrlSchema.safeParse('not-a-url');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid photo URL');
      }
    });

    it('should reject empty string', () => {
      const result = PhotoUrlSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject number', () => {
      const result = PhotoUrlSchema.safeParse(123);
      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = PhotoUrlSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });

  describe('CreateMemberSchema', () => {
    it('should accept valid member data', () => {
      const validData = {
        familyId: 'family-123',
        name: 'John Doe',
        gender: 'male',
        birthDate: '1990-01-15',
        deathDate: undefined,
        fatherId: 'father-123',
        motherId: 'mother-123',
        spouseId: 'spouse-123',
        maritalStatus: 'married',
        marriageDate: '2015-06-20',
        bio: 'A bio',
        photoUrl: 'https://example.com/photo.jpg'
      };
      const result = CreateMemberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept minimal required fields', () => {
      const minimalData = {
        familyId: 'family-123',
        name: 'John Doe',
        gender: 'male'
      };
      const result = CreateMemberSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should reject missing familyId', () => {
      const invalidData = {
        name: 'John Doe',
        gender: 'male'
      };
      const result = CreateMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing name', () => {
      const invalidData = {
        familyId: 'family-123',
        gender: 'male'
      };
      const result = CreateMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing gender', () => {
      const invalidData = {
        familyId: 'family-123',
        name: 'John Doe'
      };
      const result = CreateMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject death date before birth date', () => {
      const invalidData = {
        familyId: 'family-123',
        name: 'John Doe',
        gender: 'male',
        birthDate: '2020-01-01',
        deathDate: '2019-01-01'
      };
      const result = CreateMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Death date must be after birth date');
      }
    });

    it('should reject marriage date before birth date', () => {
      const invalidData = {
        familyId: 'family-123',
        name: 'John Doe',
        gender: 'male',
        birthDate: '2020-01-01',
        marriageDate: '2019-01-01'
      };
      const result = CreateMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Marriage date must be after birth date');
      }
    });

    it('should accept death date after birth date', () => {
      const validData = {
        familyId: 'family-123',
        name: 'John Doe',
        gender: 'male',
        birthDate: '1990-01-01',
        deathDate: '2020-01-01'
      };
      const result = CreateMemberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept marriage date after birth date', () => {
      const validData = {
        familyId: 'family-123',
        name: 'John Doe',
        gender: 'male',
        birthDate: '1990-01-01',
        marriageDate: '2015-01-01'
      };
      const result = CreateMemberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('UpdateMemberSchema', () => {
    it('should accept valid update data', () => {
      const validData = {
        familyId: 'family-123',
        memberId: 'member-123',
        name: 'Jane Doe',
        gender: 'female'
      };
      const result = UpdateMemberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept minimal required fields', () => {
      const minimalData = {
        familyId: 'family-123',
        memberId: 'member-123'
      };
      const result = UpdateMemberSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should reject missing familyId', () => {
      const invalidData = {
        memberId: 'member-123',
        name: 'Jane Doe'
      };
      const result = UpdateMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing memberId', () => {
      const invalidData = {
        familyId: 'family-123',
        name: 'Jane Doe'
      };
      const result = UpdateMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject death date before birth date', () => {
      const invalidData = {
        familyId: 'family-123',
        memberId: 'member-123',
        birthDate: '2020-01-01',
        deathDate: '2019-01-01'
      };
      const result = UpdateMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Death date must be after birth date');
      }
    });

    it('should reject marriage date before birth date', () => {
      const invalidData = {
        familyId: 'family-123',
        memberId: 'member-123',
        birthDate: '2020-01-01',
        marriageDate: '2019-01-01'
      };
      const result = UpdateMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Marriage date must be after birth date');
      }
    });
  });

  describe('DeleteMemberSchema', () => {
    it('should accept valid delete data', () => {
      const validData = {
        familyId: 'family-123',
        memberId: 'member-123'
      };
      const result = DeleteMemberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing familyId', () => {
      const invalidData = {
        memberId: 'member-123'
      };
      const result = DeleteMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing memberId', () => {
      const invalidData = {
        familyId: 'family-123'
      };
      const result = DeleteMemberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('SetParentsSchema', () => {
    it('should accept valid set parents data', () => {
      const validData = {
        familyId: 'family-123',
        memberId: 'member-123',
        fatherId: 'father-123',
        motherId: 'mother-123'
      };
      const result = SetParentsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept minimal required fields', () => {
      const minimalData = {
        familyId: 'family-123',
        memberId: 'member-123'
      };
      const result = SetParentsSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should accept only fatherId', () => {
      const validData = {
        familyId: 'family-123',
        memberId: 'member-123',
        fatherId: 'father-123'
      };
      const result = SetParentsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept only motherId', () => {
      const validData = {
        familyId: 'family-123',
        memberId: 'member-123',
        motherId: 'mother-123'
      };
      const result = SetParentsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing familyId', () => {
      const invalidData = {
        memberId: 'member-123',
        fatherId: 'father-123'
      };
      const result = SetParentsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing memberId', () => {
      const invalidData = {
        familyId: 'family-123',
        fatherId: 'father-123'
      };
      const result = SetParentsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('SetSpouseSchema', () => {
    it('should accept valid set spouse data', () => {
      const validData = {
        familyId: 'family-123',
        memberId: 'member-123',
        spouseId: 'spouse-123',
        isPrimary: true,
        marriageDate: '2015-06-20'
      };
      const result = SetSpouseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept minimal required fields', () => {
      const minimalData = {
        familyId: 'family-123',
        memberId: 'member-123',
        spouseId: 'spouse-123'
      };
      const result = SetSpouseSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should accept without isPrimary', () => {
      const validData = {
        familyId: 'family-123',
        memberId: 'member-123',
        spouseId: 'spouse-123',
        marriageDate: '2015-06-20'
      };
      const result = SetSpouseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept without marriageDate', () => {
      const validData = {
        familyId: 'family-123',
        memberId: 'member-123',
        spouseId: 'spouse-123',
        isPrimary: true
      };
      const result = SetSpouseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing familyId', () => {
      const invalidData = {
        memberId: 'member-123',
        spouseId: 'spouse-123'
      };
      const result = SetSpouseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing memberId', () => {
      const invalidData = {
        familyId: 'family-123',
        spouseId: 'spouse-123'
      };
      const result = SetSpouseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing spouseId', () => {
      const invalidData = {
        familyId: 'family-123',
        memberId: 'member-123'
      };
      const result = SetSpouseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('RemoveSpouseSchema', () => {
    it('should accept valid remove spouse data', () => {
      const validData = {
        familyId: 'family-123',
        memberId: 'member-123',
        spouseId: 'spouse-123'
      };
      const result = RemoveSpouseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing familyId', () => {
      const invalidData = {
        memberId: 'member-123',
        spouseId: 'spouse-123'
      };
      const result = RemoveSpouseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing memberId', () => {
      const invalidData = {
        familyId: 'family-123',
        spouseId: 'spouse-123'
      };
      const result = RemoveSpouseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing spouseId', () => {
      const invalidData = {
        familyId: 'family-123',
        memberId: 'member-123'
      };
      const result = RemoveSpouseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
