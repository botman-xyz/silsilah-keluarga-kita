import { useCallback } from 'react';
import { Family, Member, UserProfile } from '../../domain/entities';
import { isDuplicateMember } from '../../lib/utils';
import { toast } from 'sonner';
import { familyService, memberService } from '../../infrastructure/container';
import { handleSpouseChanges, syncSpouseOnDelete } from './useSpouseSync';
import {
  buildFamilyData,
  isFamilyDuplicate,
  deleteAllFamilyMembers,
  showFamilyToast,
  buildMemberCreateData,
  buildMemberUpdateData,
  showMemberToast,
  buildQuickAddRelative,
  findDuplicateFamilies,
  findDuplicateMembers,
  showDuplicateResults
} from './useAppUtils';

interface UseAppHandlersProps {
  user: UserProfile | null;
  families: Family[];
  selectedFamily: Family | null;
  allMembers: Member[];
  setSelectedFamily: (f: Family | null) => void;
  setShowDeleteConfirm: (show: boolean) => void;
  setShowMemberModal: (show: boolean) => void;
  setEditingMember: (m: Member | null) => void;
  setNewFamilyName: (name: string) => void;
  setShowFamilyModal: (show: boolean) => void;
  setEditingFamily: (f: Family | null) => void;
  setSelectedMemberForDetail: (m: Member | null) => void;
}

/**
 * Custom hook that extracts all application handlers from App.tsx
 * Uses Clean Architecture: Presentation → Application → Infrastructure
 * 
 * Groups handlers by domain:
 * - Family: handleAddFamily, handleDeleteFamily, handleRemoveCollaborator
 * - Member: handleViewMember, handleQuickAddRelative, handleSaveMember, handleDeleteMember
 * - Utility: checkDuplicates
 */
export function useAppHandlers({
  user,
  families,
  selectedFamily,
  allMembers,
  setSelectedFamily,
  setShowDeleteConfirm,
  setShowMemberModal,
  setEditingMember,
  setNewFamilyName,
  setShowFamilyModal,
  setEditingFamily,
  setSelectedMemberForDetail
}: UseAppHandlersProps) {

  // ============================================
  // FAMILY HANDLERS (using FamilyService)
  // ============================================

  /**
   * Add a new family or update existing family
   * If editingFamily is provided, it updates; otherwise creates new
   */
  const handleAddFamily = useCallback(async (
    nameOverride?: string,
    editingFamily?: Family | null,
    kartuKeluargaUrl?: string
  ) => {
    const nameToUse = nameOverride;
    if (!user || !nameToUse) return;

    // If editing existing family, update it
    if (editingFamily) {
      try {
        await familyService.updateFamily(editingFamily.id,
          buildFamilyData(nameToUse, user.uid, kartuKeluargaUrl)
        );

        setNewFamilyName('');
        setEditingFamily(null);
        setShowFamilyModal(false);
        showFamilyToast('update', true);
        return true;
      } catch (e) {
        showFamilyToast('update', false);
        return false;
      }
    }

    // Check for duplicates
    if (isFamilyDuplicate(families, nameToUse, user.uid)) {
      toast.error('Keluarga dengan nama ini sudah ada.');
      return false;
    }

    try {
      await familyService.createFamily(
        buildFamilyData(nameToUse, user.uid, kartuKeluargaUrl)
      );

      setNewFamilyName('');
      setShowFamilyModal(false);
      showFamilyToast('create', true);
      return true;
    } catch (e) {
      showFamilyToast('create', false);
      return false;
    }
  }, [user, families, setNewFamilyName, setShowFamilyModal, setEditingFamily]);

  /**
   * Delete a family and all its members
   */
  const handleDeleteFamily = useCallback(async () => {
    if (!selectedFamily) return;
    try {
      // Get all members first
      const members = await memberService.getMembersByFamily(selectedFamily.id);
      
      // Delete all members
      for (const member of members) {
        await memberService.deleteMember(selectedFamily.id, member.id);
      }
      
      // Delete the family
      await familyService.deleteFamily(selectedFamily.id);
      
      setSelectedFamily(null);
      setShowDeleteConfirm(false);
      toast.success('Keluarga berhasil dihapus.');
    } catch (e) {
      toast.error('Gagal menghapus keluarga.');
    }
  }, [selectedFamily, setSelectedFamily, setShowDeleteConfirm]);

  /**
   * Remove a collaborator from the selected family
   */
  const handleRemoveCollaborator = useCallback(async (collabUid: string) => {
    if (!selectedFamily || !user || selectedFamily.ownerId !== user.uid) return;
    try {
      await familyService.removeCollaborator(selectedFamily.id, collabUid);
    } catch (e) {
      toast.error('Gagal menghapus kolaborator.');
    }
  }, [selectedFamily, user]);

  // ============================================
  // MEMBER HANDLERS (using MemberService)
  // ============================================

  /**
   * Set the selected member for detail view
   */
  const handleViewMember = useCallback((member: Member) => {
    setSelectedMemberForDetail(member);
    return member;
  }, [setSelectedMemberForDetail]);

  /**
   * Quick add a relative (child/parent) from an existing member
   */
  const handleQuickAddRelative = useCallback((member: Member) => {
    const newMember: Partial<Member> = {
      familyId: selectedFamily?.id,
    };

    if (member.gender === 'male') {
      newMember.fatherId = member.id;
      if (member.spouseId) {
        newMember.motherId = member.spouseId;
      }
    } else if (member.gender === 'female') {
      newMember.motherId = member.id;
      if (member.spouseId) {
        newMember.fatherId = member.spouseId;
      }
    }

    setEditingMember(newMember as Member);
    setShowMemberModal(true);
  }, [selectedFamily, setEditingMember, setShowMemberModal]);

  /**
   * Save a member (create or update)
   */
  const handleSaveMember = useCallback(async (memberData: Partial<Member>, editingMember: Member | null) => {
    if (!selectedFamily || !user) return;

    if (!editingMember) {
      // For new members, use shared utility for duplicate detection
      const isDuplicate = isDuplicateMember(
        allMembers.filter(m => m.familyId === selectedFamily.id),
        memberData.name || '',
        memberData.birthDate,
        memberData.id
      );
      
      if (isDuplicate) {
        toast.error('Anggota dengan nama dan tanggal lahir ini sudah ada di keluarga ini.');
        return;
      }
    }

    try {
      const isEdit = !!(memberData.id && memberData.id.trim().length > 0);
      
      if (isEdit) {
        // Update existing member
        const oldSpouseId = editingMember?.spouseId;
        const newSpouseId = memberData.spouseId;

        await memberService.updateMember(selectedFamily.id, memberData.id, {
          ...memberData,
          updatedAt: new Date().toISOString()
        });

        // Handle spouse relationship changes
        if (newSpouseId !== oldSpouseId) {
          if (oldSpouseId) {
            try {
              await memberService.updateMember(selectedFamily.id, oldSpouseId, {
                spouseId: '',
                maritalStatus: 'single',
                updatedAt: new Date().toISOString()
              });
            } catch (e) {
              console.warn('Failed to update old spouse, may not exist:', oldSpouseId);
            }
          }
          if (newSpouseId) {
            try {
              await memberService.updateMember(selectedFamily.id, newSpouseId, {
                spouseId: memberData.id,
                maritalStatus: 'married',
                ...(memberData.marriageDate ? { marriageDate: memberData.marriageDate } : {}),
                updatedAt: new Date().toISOString()
              });
            } catch (e) {
              console.warn('Failed to update new spouse, may not exist:', newSpouseId);
            }
          }
        }
      } else {
        // Create new member - extract required fields from memberData
        const { id, name, gender, birthDate, fatherId, motherId, spouseId, maritalStatus, marriageDate, bio, photoUrl } = memberData;
        
        const createdMember = await memberService.createMember(selectedFamily.id, {
          name: name || '',
          gender: gender || 'other',
          familyId: selectedFamily.id,
          birthDate,
          fatherId,
          motherId,
          spouseId,
          maritalStatus,
          ...(marriageDate ? { marriageDate } : {}),
          bio,
          photoUrl,
          createdBy: user.uid,
          updatedAt: new Date().toISOString()
        });

        // If spouse is specified, update the spouse's spouseId and maritalStatus
        if (memberData.spouseId) {
          try {
            await memberService.updateMember(selectedFamily.id, memberData.spouseId, {
              spouseId: createdMember.id,
              maritalStatus: 'married',
              ...(memberData.marriageDate ? { marriageDate: memberData.marriageDate } : {}),
              updatedAt: new Date().toISOString()
            });
          } catch (e) {
            console.warn('Failed to update spouse during create, may not exist:', memberData.spouseId);
          }
        }
      }
      
      toast.success(editingMember ? 'Data anggota diperbarui!' : 'Anggota baru ditambahkan!');
    } catch (e) {
      toast.error('Gagal menyimpan data anggota.');
    }
  }, [selectedFamily, user, allMembers]);

  /**
   * Delete a member
   */
  const handleDeleteMember = useCallback(async (memberId: string, members: Member[]) => {
    if (!selectedFamily) return;
    try {
      const memberToDelete = members.find(m => m.id === memberId);
      
      // Clear spouse relationship if exists
      if (memberToDelete?.spouseId) {
        try {
          await memberService.updateMember(selectedFamily.id, memberToDelete.spouseId, {
            spouseId: '',
            maritalStatus: 'single',
            updatedAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn('Failed to update spouse during delete, may not exist:', memberToDelete.spouseId);
        }
      }
      
      await memberService.deleteMember(selectedFamily.id, memberId);
      toast.success('Anggota berhasil dihapus.');
    } catch (e) {
      toast.error('Gagal menghapus anggota.');
    }
  }, [selectedFamily]);

  // ============================================
  // UTILITY HANDLERS
  // ============================================

  /**
   * Check for duplicate families and members
   */
  const checkDuplicates = useCallback(() => {
    if (!user) return;

    const ownedFamilies = families.filter(f => f.ownerId === user.uid);
    const familyNames = new Set<string>();
    const duplicateFamilies: string[] = [];

    ownedFamilies.forEach(f => {
      const name = f.name.toLowerCase().trim();
      if (familyNames.has(name)) {
        duplicateFamilies.push(f.name);
      }
      familyNames.add(name);
    });

    const duplicateMembers: string[] = [];
    if (selectedFamily) {
      const familyMembers = allMembers.filter(m => m.familyId === selectedFamily.id);
      const memberKeys = new Set<string>();

      familyMembers.forEach(m => {
        const key = `${m.name.toLowerCase().trim()}|${m.birthDate || ''}`;
        if (memberKeys.has(key)) {
          duplicateMembers.push(m.name);
        }
        memberKeys.add(key);
      });
    }

    if (duplicateFamilies.length === 0 && duplicateMembers.length === 0) {
      toast.info('Tidak ditemukan duplikasi keluarga atau anggota.');
    } else {
      let message = '';
      if (duplicateFamilies.length > 0) {
        message += `Duplikasi keluarga: ${[...new Set(duplicateFamilies)].join(', ')}. `;
      }
      if (duplicateMembers.length > 0) {
        message += `Duplikasi anggota di keluarga ini: ${[...new Set(duplicateMembers)].join(', ')}.`;
      }
      toast.warning(message, { duration: 10000 });
    }
  }, [user, families, selectedFamily, allMembers]);

  return {
    // Family handlers
    handleAddFamily,
    handleDeleteFamily,
    handleRemoveCollaborator,
    // Member handlers
    handleViewMember,
    handleQuickAddRelative,
    handleSaveMember,
    handleDeleteMember,
    // Utility handlers
    checkDuplicates
  };
}