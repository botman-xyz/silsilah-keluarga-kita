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
  findExactDuplicates,
  findSimilarMembers,
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
      await deleteAllFamilyMembers(selectedFamily.id);
      await familyService.deleteFamily(selectedFamily.id);

      setSelectedFamily(null);
      setShowDeleteConfirm(false);
      showFamilyToast('delete', true);
    } catch (e) {
      showFamilyToast('delete', false);
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
    const newMember = buildQuickAddRelative(member, selectedFamily?.id);
    setEditingMember(newMember as Member);
    setShowMemberModal(true);
  }, [selectedFamily, setEditingMember, setShowMemberModal]);

  /**
   * Save a member (create or update)
   */
  const handleSaveMember = useCallback(async (memberData: Partial<Member>, editingMember: Member | null) => {
    if (!selectedFamily || !user) return;

    // Determine the target family - for existing members, use their actual familyId
    // This handles the mantu (in-law) scenario where member belongs to a different family
    const targetFamilyId = editingMember?.familyId || selectedFamily.id;

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

        // Use atomic batch update for spouse changes
        if (newSpouseId !== oldSpouseId) {
          // Remove old spouse relationship atomically
          if (oldSpouseId && newSpouseId) {
            // Both old and new spouse exist - switch atomically
            try {
              await memberService.removeSpouseAtomic(targetFamilyId, editingMember!.id, oldSpouseId);
              await memberService.setSpouseAtomic(
                targetFamilyId, 
                memberData.id!, 
                newSpouseId,
                true,
                memberData.marriageDate
              );
            } catch (e) {
              console.warn('Failed to update spouse relationship atomically:', e);
              // Fall back to sequential update
              await memberService.updateMember(targetFamilyId, memberData.id!, {
                ...memberData,
                updatedAt: new Date().toISOString()
              });
            }
          } else if (oldSpouseId) {
            // Only old spouse - remove it
            try {
              await memberService.removeSpouseAtomic(targetFamilyId, editingMember!.id, oldSpouseId);
            } catch (e) {
              console.warn('Failed to remove old spouse:', e);
            }
            // Then update the member
            await memberService.updateMember(targetFamilyId, memberData.id!, {
              ...memberData,
              spouseId: '',
              maritalStatus: memberData.spouseId ? 'married' : (memberData.maritalStatus || 'single'),
              updatedAt: new Date().toISOString()
            });
          } else if (newSpouseId) {
            // Only new spouse - add it
            try {
              await memberService.setSpouseAtomic(
                targetFamilyId,
                memberData.id!,
                newSpouseId,
                true,
                memberData.marriageDate
              );
            } catch (e) {
              console.warn('Failed to add new spouse:', e);
              // Fall back to sequential update
              await memberService.updateMember(targetFamilyId, memberData.id!, {
                ...memberData,
                updatedAt: new Date().toISOString()
              });
            }
          }
        } else {
          // No spouse change - regular update
          await memberService.updateMember(targetFamilyId, memberData.id!, {
            ...memberData,
            updatedAt: new Date().toISOString()
          });
        }
      } else {
        // Create new member - extract required fields from memberData
        const { id, name, gender, birthDate, fatherId, motherId, spouseId, maritalStatus, marriageDate, bio, photoUrl } = memberData;
        
        const createdMember = await memberService.createMember(targetFamilyId, {
          name: name || '',
          gender: gender || 'other',
          familyId: targetFamilyId,
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

        // If spouse is specified, update the spouse's spouseId and maritalStatus atomically
        if (memberData.spouseId) {
          try {
            await memberService.setSpouseAtomic(
              targetFamilyId,
              createdMember.id,
              memberData.spouseId,
              true,
              memberData.marriageDate
            );
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
      // Use atomic delete to clear spouse and parent references
      await memberService.deleteMemberAtomic(selectedFamily.id, memberId);
      toast.success('Anggota berhasil dihapus.');
    } catch (e) {
      console.warn('Atomic delete failed, falling back to simple delete:', e);
      // Fallback to simple delete
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
            console.warn('Failed to update spouse during delete:', e);
          }
        }
        
        await memberService.deleteMember(selectedFamily.id, memberId);
        toast.success('Anggota berhasil dihapus.');
      } catch (fallbackError) {
        toast.error('Gagal menghapus anggota.');
      }
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

    const duplicateFamilies = findDuplicateFamilies(families, user.uid);
    const familyMembers = selectedFamily
      ? allMembers.filter(m => m.familyId === selectedFamily.id)
      : [];

    // Check for exact duplicates (same name + birthDate)
    const exactDuplicates = findExactDuplicates(familyMembers);
    
    // Check for similar names
    const similarMembers = findSimilarMembers(familyMembers);

    // Combine results
    const duplicateNames = [...new Set(exactDuplicates.flat().map(m => m.name))];
    
    showDuplicateResults(duplicateFamilies, duplicateNames, exactDuplicates, similarMembers);
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