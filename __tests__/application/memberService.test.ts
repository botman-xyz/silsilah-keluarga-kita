import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemberService } from '../../src/application/services/MemberService';
import { Member } from '../../src/domain/entities';
import { IMemberRepository } from '../../src/domain/repositories';

describe('Application - MemberService', () => {
  let memberService: MemberService;
  let mockRepository: IMemberRepository;

  const createMember = (
    id: string,
    name: string,
    gender: 'male' | 'female' | 'other',
    options: Partial<Member> = {}
  ): Member => ({
    id,
    familyId: 'family-1',
    name,
    gender,
    createdBy: 'test-user',
    updatedAt: new Date().toISOString(),
    ...options
  });

  beforeEach(() => {
    mockRepository = {
      getByFamilyId: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      subscribeByFamilyId: vi.fn(),
      batchUpdate: vi.fn()
    };

    memberService = new MemberService(mockRepository);
  });

  describe('getMembersByFamily', () => {
    it('should get all members for a family', async () => {
      const members = [
        createMember('member-1', 'Member 1', 'male'),
        createMember('member-2', 'Member 2', 'female')
      ];

      vi.mocked(mockRepository.getByFamilyId).mockResolvedValue(members);

      const result = await memberService.getMembersByFamily('family-1');

      expect(mockRepository.getByFamilyId).toHaveBeenCalledWith('family-1');
      expect(result).toEqual(members);
    });

    it('should return empty array for family with no members', async () => {
      vi.mocked(mockRepository.getByFamilyId).mockResolvedValue([]);

      const result = await memberService.getMembersByFamily('family-1');

      expect(result).toEqual([]);
    });
  });

  describe('getMember', () => {
    it('should get a single member', async () => {
      const member = createMember('member-1', 'Member 1', 'male');

      vi.mocked(mockRepository.getById).mockResolvedValue(member);

      const result = await memberService.getMember('family-1', 'member-1');

      expect(mockRepository.getById).toHaveBeenCalledWith('family-1', 'member-1');
      expect(result).toEqual(member);
    });

    it('should return null for non-existent member', async () => {
      vi.mocked(mockRepository.getById).mockResolvedValue(null);

      const result = await memberService.getMember('family-1', 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createMember', () => {
    it('should create a new member', async () => {
      const memberData = {
        familyId: 'family-1',
        name: 'New Member',
        gender: 'male' as const,
        createdBy: 'test-user',
        updatedAt: new Date().toISOString()
      };

      const createdMember = createMember('new-id', 'New Member', 'male');

      vi.mocked(mockRepository.create).mockResolvedValue(createdMember);

      const result = await memberService.createMember('family-1', memberData);

      expect(mockRepository.create).toHaveBeenCalledWith('family-1', expect.objectContaining({
        ...memberData,
        updatedAt: expect.any(String)
      }));
      expect(result).toEqual(createdMember);
    });
  });

  describe('updateMember', () => {
    it('should update a member', async () => {
      const updateData = { name: 'Updated Name' };

      vi.mocked(mockRepository.update).mockResolvedValue(undefined);

      await memberService.updateMember('family-1', 'member-1', updateData);

      expect(mockRepository.update).toHaveBeenCalledWith('family-1', 'member-1', expect.objectContaining({
        ...updateData,
        updatedAt: expect.any(String)
      }));
    });
  });

  describe('deleteMember', () => {
    it('should delete a member', async () => {
      vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

      await memberService.deleteMember('family-1', 'member-1');

      expect(mockRepository.delete).toHaveBeenCalledWith('family-1', 'member-1');
    });
  });

  describe('getMembersByFamilies', () => {
    it('should get members from multiple families', async () => {
      const family1Members = [createMember('member-1', 'Member 1', 'male')];
      const family2Members = [createMember('member-2', 'Member 2', 'female')];

      vi.mocked(mockRepository.getByFamilyId)
        .mockResolvedValueOnce(family1Members)
        .mockResolvedValueOnce(family2Members);

      const result = await memberService.getMembersByFamilies(['family-1', 'family-2']);

      expect(result).toEqual([...family1Members, ...family2Members]);
    });
  });

  describe('setParents', () => {
    it('should set father and mother', async () => {
      vi.mocked(mockRepository.update).mockResolvedValue(undefined);

      await memberService.setParents('family-1', 'child-1', 'father-1', 'mother-1');

      expect(mockRepository.update).toHaveBeenCalledWith('family-1', 'child-1', {
        fatherId: 'father-1',
        motherId: 'mother-1'
      });
    });

    it('should set only father', async () => {
      vi.mocked(mockRepository.update).mockResolvedValue(undefined);

      await memberService.setParents('family-1', 'child-1', 'father-1');

      expect(mockRepository.update).toHaveBeenCalledWith('family-1', 'child-1', {
        fatherId: 'father-1'
      });
    });

    it('should set only mother', async () => {
      vi.mocked(mockRepository.update).mockResolvedValue(undefined);

      await memberService.setParents('family-1', 'child-1', undefined, 'mother-1');

      expect(mockRepository.update).toHaveBeenCalledWith('family-1', 'child-1', {
        motherId: 'mother-1'
      });
    });
  });

  describe('setSpouse', () => {
    it('should set primary spouse', async () => {
      const member = createMember('member-1', 'Member 1', 'male');

      vi.mocked(mockRepository.getById).mockResolvedValue(member);
      vi.mocked(mockRepository.update).mockResolvedValue(undefined);

      await memberService.setSpouse('family-1', 'member-1', 'spouse-1', true);

      expect(mockRepository.update).toHaveBeenCalledWith('family-1', 'member-1', expect.objectContaining({
        spouseId: 'spouse-1',
        spouseIds: ['spouse-1'],
        maritalStatus: 'married'
      }));
    });

    it('should set non-primary spouse', async () => {
      const member = createMember('member-1', 'Member 1', 'male', {
        spouseIds: ['spouse-1']
      });

      vi.mocked(mockRepository.getById).mockResolvedValue(member);
      vi.mocked(mockRepository.update).mockResolvedValue(undefined);

      await memberService.setSpouse('family-1', 'member-1', 'spouse-2', false);

      expect(mockRepository.update).toHaveBeenCalledWith('family-1', 'member-1', expect.objectContaining({
        spouseIds: ['spouse-1', 'spouse-2']
      }));
    });

    it('should throw error for non-existent member', async () => {
      vi.mocked(mockRepository.getById).mockResolvedValue(null);

      await expect(memberService.setSpouse('family-1', 'member-1', 'spouse-1'))
        .rejects.toThrow('Anggota keluarga tidak ditemukan');
    });
  });

  describe('removeSpouse', () => {
    it('should remove spouse', async () => {
      const member = createMember('member-1', 'Member 1', 'male', {
        spouseId: 'spouse-1',
        spouseIds: ['spouse-1'],
        maritalStatus: 'married'
      });

      vi.mocked(mockRepository.getById).mockResolvedValue(member);
      vi.mocked(mockRepository.update).mockResolvedValue(undefined);

      await memberService.removeSpouse('family-1', 'member-1', 'spouse-1');

      expect(mockRepository.update).toHaveBeenCalledWith('family-1', 'member-1', expect.objectContaining({
        spouseIds: [],
        spouseId: undefined,
        maritalStatus: 'widowed'
      }));
    });

    it('should throw error for non-existent member', async () => {
      vi.mocked(mockRepository.getById).mockResolvedValue(null);

      await expect(memberService.removeSpouse('family-1', 'member-1', 'spouse-1'))
        .rejects.toThrow('Anggota keluarga tidak ditemukan');
    });
  });

  describe('setSpouseAtomic', () => {
    it('should set spouse for both members atomically', async () => {
      const member = createMember('member-1', 'Member 1', 'male');
      const spouse = createMember('spouse-1', 'Spouse 1', 'female');

      vi.mocked(mockRepository.getById)
        .mockResolvedValueOnce(member)
        .mockResolvedValueOnce(spouse);
      vi.mocked(mockRepository.batchUpdate).mockResolvedValue(undefined);

      await memberService.setSpouseAtomic('family-1', 'member-1', 'spouse-1', true, '2020-01-01');

      expect(mockRepository.batchUpdate).toHaveBeenCalledWith('family-1', [
        { memberId: 'member-1', data: expect.objectContaining({ spouseId: 'spouse-1', marriageDate: '2020-01-01' }) },
        { memberId: 'spouse-1', data: expect.objectContaining({ spouseId: 'member-1', marriageDate: '2020-01-01' }) }
      ]);
    });

    it('should throw error for non-existent member', async () => {
      vi.mocked(mockRepository.getById).mockResolvedValue(null);

      await expect(memberService.setSpouseAtomic('family-1', 'member-1', 'spouse-1'))
        .rejects.toThrow('Anggota keluarga tidak ditemukan');
    });

    it('should throw error for non-existent spouse', async () => {
      const member = createMember('member-1', 'Member 1', 'male');

      vi.mocked(mockRepository.getById)
        .mockResolvedValueOnce(member)
        .mockResolvedValueOnce(null);

      await expect(memberService.setSpouseAtomic('family-1', 'member-1', 'spouse-1'))
        .rejects.toThrow('Pasangan tidak ditemukan');
    });
  });

  describe('removeSpouseAtomic', () => {
    it('should remove spouse for both members atomically', async () => {
      const member = createMember('member-1', 'Member 1', 'male', {
        spouseId: 'spouse-1',
        spouseIds: ['spouse-1']
      });
      const spouse = createMember('spouse-1', 'Spouse 1', 'female', {
        spouseId: 'member-1',
        spouseIds: ['member-1']
      });

      vi.mocked(mockRepository.getById)
        .mockResolvedValueOnce(member)
        .mockResolvedValueOnce(spouse);
      vi.mocked(mockRepository.batchUpdate).mockResolvedValue(undefined);

      await memberService.removeSpouseAtomic('family-1', 'member-1', 'spouse-1');

      expect(mockRepository.batchUpdate).toHaveBeenCalledWith('family-1', [
        { memberId: 'member-1', data: expect.objectContaining({ spouseIds: [], maritalStatus: 'widowed' }) },
        { memberId: 'spouse-1', data: expect.objectContaining({ spouseIds: [], maritalStatus: 'widowed' }) }
      ]);
    });

    it('should throw error for non-existent member', async () => {
      vi.mocked(mockRepository.getById).mockResolvedValue(null);

      await expect(memberService.removeSpouseAtomic('family-1', 'member-1', 'spouse-1'))
        .rejects.toThrow('Anggota keluarga tidak ditemukan');
    });
  });

  describe('setParentsAtomic', () => {
    it('should set parents for child', async () => {
      const child = createMember('child-1', 'Child', 'male');

      vi.mocked(mockRepository.getById).mockResolvedValue(child);
      vi.mocked(mockRepository.update).mockResolvedValue(undefined);

      await memberService.setParentsAtomic('family-1', 'child-1', 'father-1', 'mother-1');

      expect(mockRepository.update).toHaveBeenCalledWith('family-1', 'child-1', expect.objectContaining({
        fatherId: 'father-1',
        motherId: 'mother-1'
      }));
    });

    it('should throw error for non-existent child', async () => {
      vi.mocked(mockRepository.getById).mockResolvedValue(null);

      await expect(memberService.setParentsAtomic('family-1', 'child-1', 'father-1', 'mother-1'))
        .rejects.toThrow('Anggota keluarga tidak ditemukan');
    });
  });

  describe('deleteMemberAtomic', () => {
    it('should delete member and clear references', async () => {
      const member = createMember('member-1', 'Member 1', 'male', {
        spouseId: 'spouse-1'
      });
      const spouse = createMember('spouse-1', 'Spouse 1', 'female', {
        spouseId: 'member-1'
      });
      const child = createMember('child-1', 'Child', 'male', {
        fatherId: 'member-1'
      });

      vi.mocked(mockRepository.getByFamilyId).mockResolvedValue([member, spouse, child]);
      vi.mocked(mockRepository.batchUpdate).mockResolvedValue(undefined);
      vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

      await memberService.deleteMemberAtomic('family-1', 'member-1');

      expect(mockRepository.batchUpdate).toHaveBeenCalled();
      expect(mockRepository.delete).toHaveBeenCalledWith('family-1', 'member-1');
    });

    it('should throw error for non-existent member', async () => {
      vi.mocked(mockRepository.getByFamilyId).mockResolvedValue([]);

      await expect(memberService.deleteMemberAtomic('family-1', 'member-1'))
        .rejects.toThrow('Anggota keluarga tidak ditemukan');
    });
  });

  describe('findPotentialDuplicates', () => {
    it('should find potential duplicates', () => {
      const members = [
        createMember('member-1', 'Budi Santoso', 'male', { birthDate: '1990-01-01' }),
        createMember('member-2', 'Budi Santoso', 'male', { birthDate: '1990-01-01' }),
        createMember('member-3', 'Siti Rahayu', 'female', { birthDate: '1990-01-01' })
      ];

      const duplicates = memberService.findPotentialDuplicates('family-1', members);

      expect(duplicates.length).toBe(2);
      expect(duplicates.map(m => m.name)).toEqual(['Budi Santoso', 'Budi Santoso']);
    });

    it('should return empty array for no duplicates', () => {
      const members = [
        createMember('member-1', 'Budi Santoso', 'male', { birthDate: '1990-01-01' }),
        createMember('member-2', 'Siti Rahayu', 'female', { birthDate: '1990-01-01' })
      ];

      const duplicates = memberService.findPotentialDuplicates('family-1', members);

      expect(duplicates).toEqual([]);
    });
  });

  describe('isDuplicateMember', () => {
    it('should detect duplicate member', () => {
      const members = [
        createMember('member-1', 'Budi Santoso', 'male', { birthDate: '1990-01-01' })
      ];

      const isDuplicate = memberService.isDuplicateMember(members, 'Budi Santoso', '1990-01-01');

      expect(isDuplicate).toBe(true);
    });

    it('should not detect duplicate for different name', () => {
      const members = [
        createMember('member-1', 'Budi Santoso', 'male', { birthDate: '1990-01-01' })
      ];

      const isDuplicate = memberService.isDuplicateMember(members, 'Siti Rahayu', '1990-01-01');

      expect(isDuplicate).toBe(false);
    });

    it('should not detect duplicate for different birth date', () => {
      const members = [
        createMember('member-1', 'Budi Santoso', 'male', { birthDate: '1990-01-01' })
      ];

      const isDuplicate = memberService.isDuplicateMember(members, 'Budi Santoso', '2000-01-01');

      expect(isDuplicate).toBe(false);
    });

    it('should exclude member by ID', () => {
      const members = [
        createMember('member-1', 'Budi Santoso', 'male', { birthDate: '1990-01-01' })
      ];

      const isDuplicate = memberService.isDuplicateMember(members, 'Budi Santoso', '1990-01-01', 'member-1');

      expect(isDuplicate).toBe(false);
    });
  });
});
