import { describe, it, expect } from 'vitest';
import {
  BirthDate,
  DeathDate,
  MemberId,
  FamilyId,
  FamilyName,
  Collaborators,
  Gender,
  MaritalStatus,
  MemberName,
  SpouseIds,
  ParentIds,
  MediaCollection
} from '../../src/domain/valueObjects';

describe('Domain - Value Objects', () => {
  describe('BirthDate', () => {
    it('should create valid birth date', () => {
      const birthDate = new BirthDate('1990-01-01');
      expect(birthDate.getValue()).toBe('1990-01-01');
      expect(birthDate.hasValue()).toBe(true);
    });

    it('should handle undefined birth date', () => {
      const birthDate = new BirthDate(undefined);
      expect(birthDate.getValue()).toBeUndefined();
      expect(birthDate.hasValue()).toBe(false);
    });

    it('should throw error for invalid date format', () => {
      expect(() => new BirthDate('invalid-date')).toThrow('Invalid birth date format');
    });

    it('should convert to Date object', () => {
      const birthDate = new BirthDate('1990-01-01');
      const date = birthDate.toDate();
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(1990);
    });

    it('should calculate age correctly', () => {
      const birthDate = new BirthDate('1990-01-01');
      const endDate = new Date('2020-01-01');
      const age = birthDate.calculateAge(endDate);
      expect(age).toBe(30);
    });

    it('should calculate age with birthday not yet passed', () => {
      const birthDate = new BirthDate('1990-12-31');
      const endDate = new Date('2020-06-15');
      const age = birthDate.calculateAge(endDate);
      expect(age).toBe(29);
    });

    it('should return null for age when no birth date', () => {
      const birthDate = new BirthDate(undefined);
      const age = birthDate.calculateAge();
      expect(age).toBeNull();
    });
  });

  describe('DeathDate', () => {
    it('should create valid death date', () => {
      const deathDate = new DeathDate('2020-01-01');
      expect(deathDate.getValue()).toBe('2020-01-01');
      expect(deathDate.hasValue()).toBe(true);
    });

    it('should handle undefined death date', () => {
      const deathDate = new DeathDate(undefined);
      expect(deathDate.getValue()).toBeUndefined();
      expect(deathDate.hasValue()).toBe(false);
    });

    it('should throw error for invalid date format', () => {
      expect(() => new DeathDate('invalid-date')).toThrow('Invalid death date format');
    });

    it('should convert to Date object', () => {
      const deathDate = new DeathDate('2020-01-01');
      const date = deathDate.toDate();
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2020);
    });
  });

  describe('MemberId', () => {
    it('should create valid member ID', () => {
      const memberId = new MemberId('member-123');
      expect(memberId.getValue()).toBe('member-123');
      expect(memberId.toString()).toBe('member-123');
    });

    it('should throw error for empty ID', () => {
      expect(() => new MemberId('')).toThrow('Member ID cannot be empty');
      expect(() => new MemberId('  ')).toThrow('Member ID cannot be empty');
    });

    it('should compare equality correctly', () => {
      const id1 = new MemberId('member-123');
      const id2 = new MemberId('member-123');
      const id3 = new MemberId('member-456');

      expect(id1.equals(id2)).toBe(true);
      expect(id1.equals(id3)).toBe(false);
    });
  });

  describe('FamilyId', () => {
    it('should create valid family ID', () => {
      const familyId = new FamilyId('family-123');
      expect(familyId.getValue()).toBe('family-123');
      expect(familyId.toString()).toBe('family-123');
    });

    it('should throw error for empty ID', () => {
      expect(() => new FamilyId('')).toThrow('Family ID cannot be empty');
      expect(() => new FamilyId('  ')).toThrow('Family ID cannot be empty');
    });

    it('should compare equality correctly', () => {
      const id1 = new FamilyId('family-123');
      const id2 = new FamilyId('family-123');
      const id3 = new FamilyId('family-456');

      expect(id1.equals(id2)).toBe(true);
      expect(id1.equals(id3)).toBe(false);
    });
  });

  describe('FamilyName', () => {
    it('should create valid family name', () => {
      const familyName = new FamilyName('Keluarga Budi');
      expect(familyName.getValue()).toBe('Keluarga Budi');
      expect(familyName.toString()).toBe('Keluarga Budi');
    });

    it('should trim whitespace', () => {
      const familyName = new FamilyName('  Keluarga Budi  ');
      expect(familyName.getValue()).toBe('Keluarga Budi');
    });

    it('should throw error for empty name', () => {
      expect(() => new FamilyName('')).toThrow('Family name cannot be empty');
      expect(() => new FamilyName('  ')).toThrow('Family name cannot be empty');
    });

    it('should throw error for name exceeding 100 characters', () => {
      const longName = 'A'.repeat(101);
      expect(() => new FamilyName(longName)).toThrow('Family name cannot exceed 100 characters');
    });

    it('should normalize for comparison', () => {
      const name1 = new FamilyName('Keluarga Budi');
      const name2 = new FamilyName('keluarga budi');
      const name3 = new FamilyName('KELUARGA BUDI');

      expect(name1.normalized()).toBe('keluarga budi');
      expect(name2.normalized()).toBe('keluarga budi');
      expect(name3.normalized()).toBe('keluarga budi');
    });

    it('should compare equality ignoring case', () => {
      const name1 = new FamilyName('Keluarga Budi');
      const name2 = new FamilyName('keluarga budi');
      const name3 = new FamilyName('Keluarga Sari');

      expect(name1.equals(name2)).toBe(true);
      expect(name1.equals(name3)).toBe(false);
    });
  });

  describe('Collaborators', () => {
    it('should create empty collaborators list', () => {
      const collaborators = new Collaborators();
      expect(collaborators.getValue()).toEqual([]);
      expect(collaborators.count()).toBe(0);
    });

    it('should create collaborators from array', () => {
      const collaborators = new Collaborators(['user-1', 'user-2']);
      expect(collaborators.getValue()).toEqual(['user-1', 'user-2']);
      expect(collaborators.count()).toBe(2);
    });

    it('should remove duplicates', () => {
      const collaborators = new Collaborators(['user-1', 'user-1', 'user-2']);
      expect(collaborators.getValue()).toEqual(['user-1', 'user-2']);
      expect(collaborators.count()).toBe(2);
    });

    it('should check if collaborator exists', () => {
      const collaborators = new Collaborators(['user-1', 'user-2']);
      expect(collaborators.hasCollaborator('user-1')).toBe(true);
      expect(collaborators.hasCollaborator('user-3')).toBe(false);
    });

    it('should add collaborator', () => {
      const collaborators = new Collaborators(['user-1']);
      const newCollaborators = collaborators.add('user-2');
      
      expect(newCollaborators.hasCollaborator('user-2')).toBe(true);
      expect(newCollaborators.count()).toBe(2);
    });

    it('should not add duplicate collaborator', () => {
      const collaborators = new Collaborators(['user-1']);
      const newCollaborators = collaborators.add('user-1');
      
      expect(newCollaborators.count()).toBe(1);
    });

    it('should remove collaborator', () => {
      const collaborators = new Collaborators(['user-1', 'user-2']);
      const newCollaborators = collaborators.remove('user-1');
      
      expect(newCollaborators.hasCollaborator('user-1')).toBe(false);
      expect(newCollaborators.count()).toBe(1);
    });
  });

  describe('Gender', () => {
    it('should create valid gender values', () => {
      const male = new Gender('male');
      const female = new Gender('female');
      const other = new Gender('other');

      expect(male.getValue()).toBe('male');
      expect(female.getValue()).toBe('female');
      expect(other.getValue()).toBe('other');
    });

    it('should throw error for invalid gender', () => {
      expect(() => new Gender('Male' as any)).toThrow('Invalid gender value');
      expect(() => new Gender('unknown' as any)).toThrow('Invalid gender value');
    });

    it('should check gender type', () => {
      const male = new Gender('male');
      const female = new Gender('female');
      const other = new Gender('other');

      expect(male.isMale()).toBe(true);
      expect(male.isFemale()).toBe(false);
      expect(female.isMale()).toBe(false);
      expect(female.isFemale()).toBe(true);
      expect(other.isMale()).toBe(false);
      expect(other.isFemale()).toBe(false);
    });

    it('should convert to string', () => {
      const gender = new Gender('male');
      expect(gender.toString()).toBe('male');
    });
  });

  describe('MaritalStatus', () => {
    it('should create valid marital status values', () => {
      const single = new MaritalStatus('single');
      const married = new MaritalStatus('married');
      const divorced = new MaritalStatus('divorced');
      const widowed = new MaritalStatus('widowed');

      expect(single.getValue()).toBe('single');
      expect(married.getValue()).toBe('married');
      expect(divorced.getValue()).toBe('divorced');
      expect(widowed.getValue()).toBe('widowed');
    });

    it('should throw error for invalid marital status', () => {
      expect(() => new MaritalStatus('Single' as any)).toThrow('Invalid marital status value');
      expect(() => new MaritalStatus('unknown' as any)).toThrow('Invalid marital status value');
    });

    it('should check marital status type', () => {
      const single = new MaritalStatus('single');
      const married = new MaritalStatus('married');

      expect(single.isSingle()).toBe(true);
      expect(single.isMarried()).toBe(false);
      expect(married.isSingle()).toBe(false);
      expect(married.isMarried()).toBe(true);
    });

    it('should convert to string', () => {
      const status = new MaritalStatus('married');
      expect(status.toString()).toBe('married');
    });
  });

  describe('MemberName', () => {
    it('should create valid member name', () => {
      const name = new MemberName('Budi Santoso');
      expect(name.getValue()).toBe('Budi Santoso');
      expect(name.toString()).toBe('Budi Santoso');
    });

    it('should trim whitespace', () => {
      const name = new MemberName('  Budi Santoso  ');
      expect(name.getValue()).toBe('Budi Santoso');
    });

    it('should throw error for empty name', () => {
      expect(() => new MemberName('')).toThrow('Member name cannot be empty');
      expect(() => new MemberName('  ')).toThrow('Member name cannot be empty');
    });

    it('should throw error for name exceeding 100 characters', () => {
      const longName = 'A'.repeat(101);
      expect(() => new MemberName(longName)).toThrow('Member name cannot exceed 100 characters');
    });

    it('should normalize for comparison', () => {
      const name1 = new MemberName('Budi Santoso');
      const name2 = new MemberName('budi santoso');
      const name3 = new MemberName('BUDI SANTOSO');

      expect(name1.normalized()).toBe('budi santoso');
      expect(name2.normalized()).toBe('budi santoso');
      expect(name3.normalized()).toBe('budi santoso');
    });

    it('should compare equality ignoring case', () => {
      const name1 = new MemberName('Budi Santoso');
      const name2 = new MemberName('budi santoso');
      const name3 = new MemberName('Siti Rahayu');

      expect(name1.equals(name2)).toBe(true);
      expect(name1.equals(name3)).toBe(false);
    });
  });

  describe('SpouseIds', () => {
    it('should create empty spouse IDs', () => {
      const spouseIds = new SpouseIds();
      expect(spouseIds.getValue()).toEqual([]);
      expect(spouseIds.count()).toBe(0);
      expect(spouseIds.isEmpty()).toBe(true);
    });

    it('should create spouse IDs from array', () => {
      const spouseIds = new SpouseIds(['spouse-1', 'spouse-2']);
      expect(spouseIds.getValue()).toEqual(['spouse-1', 'spouse-2']);
      expect(spouseIds.count()).toBe(2);
    });

    it('should remove duplicates', () => {
      const spouseIds = new SpouseIds(['spouse-1', 'spouse-1', 'spouse-2']);
      expect(spouseIds.getValue()).toEqual(['spouse-1', 'spouse-2']);
      expect(spouseIds.count()).toBe(2);
    });

    it('should set primary spouse', () => {
      const spouseIds = new SpouseIds(['spouse-1', 'spouse-2'], 'spouse-2');
      expect(spouseIds.getPrimary()).toBe('spouse-2');
    });

    it('should default to first spouse as primary', () => {
      const spouseIds = new SpouseIds(['spouse-1', 'spouse-2']);
      expect(spouseIds.getPrimary()).toBe('spouse-1');
    });

    it('should check if spouse exists', () => {
      const spouseIds = new SpouseIds(['spouse-1', 'spouse-2']);
      expect(spouseIds.hasSpouse('spouse-1')).toBe(true);
      expect(spouseIds.hasSpouse('spouse-3')).toBe(false);
    });

    it('should add spouse', () => {
      const spouseIds = new SpouseIds(['spouse-1']);
      const newSpouseIds = spouseIds.add('spouse-2');
      
      expect(newSpouseIds.hasSpouse('spouse-2')).toBe(true);
      expect(newSpouseIds.count()).toBe(2);
    });

    it('should not add duplicate spouse', () => {
      const spouseIds = new SpouseIds(['spouse-1']);
      const newSpouseIds = spouseIds.add('spouse-1');
      
      expect(newSpouseIds.count()).toBe(1);
    });

    it('should remove spouse', () => {
      const spouseIds = new SpouseIds(['spouse-1', 'spouse-2']);
      const newSpouseIds = spouseIds.remove('spouse-1');
      
      expect(newSpouseIds.hasSpouse('spouse-1')).toBe(false);
      expect(newSpouseIds.count()).toBe(1);
    });

    it('should update primary when removing primary spouse', () => {
      const spouseIds = new SpouseIds(['spouse-1', 'spouse-2'], 'spouse-1');
      const newSpouseIds = spouseIds.remove('spouse-1');
      
      expect(newSpouseIds.getPrimary()).toBe('spouse-2');
    });
  });

  describe('ParentIds', () => {
    it('should create parent IDs with both parents', () => {
      const parentIds = new ParentIds('father-1', 'mother-1');
      expect(parentIds.getFatherId()).toBe('father-1');
      expect(parentIds.getMotherId()).toBe('mother-1');
      expect(parentIds.hasFather()).toBe(true);
      expect(parentIds.hasMother()).toBe(true);
      expect(parentIds.hasParents()).toBe(true);
    });

    it('should create parent IDs with only father', () => {
      const parentIds = new ParentIds('father-1');
      expect(parentIds.getFatherId()).toBe('father-1');
      expect(parentIds.getMotherId()).toBeUndefined();
      expect(parentIds.hasFather()).toBe(true);
      expect(parentIds.hasMother()).toBe(false);
      expect(parentIds.hasParents()).toBe(false);
    });

    it('should create parent IDs with only mother', () => {
      const parentIds = new ParentIds(undefined, 'mother-1');
      expect(parentIds.getFatherId()).toBeUndefined();
      expect(parentIds.getMotherId()).toBe('mother-1');
      expect(parentIds.hasFather()).toBe(false);
      expect(parentIds.hasMother()).toBe(true);
      expect(parentIds.hasParents()).toBe(false);
    });

    it('should create empty parent IDs', () => {
      const parentIds = new ParentIds();
      expect(parentIds.getFatherId()).toBeUndefined();
      expect(parentIds.getMotherId()).toBeUndefined();
      expect(parentIds.hasFather()).toBe(false);
      expect(parentIds.hasMother()).toBe(false);
      expect(parentIds.hasParents()).toBe(false);
    });

    it('should set father ID', () => {
      const parentIds = new ParentIds(undefined, 'mother-1');
      const newParentIds = parentIds.setFather('father-1');
      
      expect(newParentIds.getFatherId()).toBe('father-1');
      expect(newParentIds.getMotherId()).toBe('mother-1');
    });

    it('should set mother ID', () => {
      const parentIds = new ParentIds('father-1');
      const newParentIds = parentIds.setMother('mother-1');
      
      expect(newParentIds.getFatherId()).toBe('father-1');
      expect(newParentIds.getMotherId()).toBe('mother-1');
    });
  });

  describe('MediaCollection', () => {
    it('should create empty media collection', () => {
      const media = new MediaCollection();
      expect(media.getItems()).toEqual([]);
      expect(media.count()).toBe(0);
      expect(media.isEmpty()).toBe(true);
    });

    it('should create media collection from array', () => {
      const items = [
        { url: 'photo1.jpg', type: 'image' as const, name: 'Photo 1' },
        { url: 'doc.pdf', type: 'document' as const, name: 'Document' }
      ];
      const media = new MediaCollection(items);
      
      expect(media.count()).toBe(2);
      expect(media.isEmpty()).toBe(false);
    });

    it('should get only images', () => {
      const items = [
        { url: 'photo1.jpg', type: 'image' as const, name: 'Photo 1' },
        { url: 'photo2.jpg', type: 'image' as const, name: 'Photo 2' },
        { url: 'doc.pdf', type: 'document' as const, name: 'Document' }
      ];
      const media = new MediaCollection(items);
      
      const images = media.getImages();
      expect(images.length).toBe(2);
      expect(images.every(img => img.type === 'image')).toBe(true);
    });

    it('should get only documents', () => {
      const items = [
        { url: 'photo1.jpg', type: 'image' as const, name: 'Photo 1' },
        { url: 'doc1.pdf', type: 'document' as const, name: 'Document 1' },
        { url: 'doc2.pdf', type: 'document' as const, name: 'Document 2' }
      ];
      const media = new MediaCollection(items);
      
      const documents = media.getDocuments();
      expect(documents.length).toBe(2);
      expect(documents.every(doc => doc.type === 'document')).toBe(true);
    });

    it('should add media item', () => {
      const media = new MediaCollection([]);
      const newMedia = media.add({ url: 'photo1.jpg', type: 'image', name: 'Photo 1' });
      
      expect(newMedia.count()).toBe(1);
      expect(newMedia.getItems()[0].url).toBe('photo1.jpg');
    });

    it('should remove media item', () => {
      const items = [
        { url: 'photo1.jpg', type: 'image' as const, name: 'Photo 1' },
        { url: 'photo2.jpg', type: 'image' as const, name: 'Photo 2' }
      ];
      const media = new MediaCollection(items);
      const newMedia = media.remove('photo1.jpg');
      
      expect(newMedia.count()).toBe(1);
      expect(newMedia.getItems()[0].url).toBe('photo2.jpg');
    });
  });
});
