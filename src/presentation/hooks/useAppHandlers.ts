import { useCallback } from 'react';
import { db, collection, addDoc, updateDoc, deleteDoc, doc, setDoc, getDocs, handleFirestoreError, OperationType } from '../../firebase';
import { Family, Member, UserProfile } from '../../types';
import { isDuplicateMember } from '../../lib/utils';
import { toast } from 'sonner';
import { FirebaseFamilyRepository } from '../../infrastructure/repositories/FirebaseFamilyRepository';
import { FirebaseMemberRepository } from '../../infrastructure/repositories/FirebaseMemberRepository';
import { FamilyService } from '../../application/services/FamilyService';
import { MemberService } from '../../application/services/MemberService';

// Initialize services (repositories use db internally from firebase.ts)
const familyRepository = new FirebaseFamilyRepository();
const memberRepository = new FirebaseMemberRepository();
const familyService = new FamilyService(familyRepository);
const memberService = new MemberService(memberRepository);

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
 * Groups handlers by domain: Family, Member, and Utility
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
  // FAMILY HANDLERS
  // ============================================

  /**
   * Add a new family or update existing family
   * If editingFamily is provided, it updates; otherwise creates new
   */
  const handleAddFamily = useCallback(async (nameOverride?: string, editingFamily?: Family | null) => {
    const nameToUse = nameOverride;
    if (!user || !nameToUse) return;
    
    // If editing existing family, update it
    if (editingFamily) {
      try {
        await updateDoc(doc(db, 'families', editingFamily.id), {
          name: nameToUse.trim()
        });
        
        setNewFamilyName('');
        setEditingFamily(null);
        setShowFamilyModal(false);
        toast.success('Keluarga berhasil diperbarui!');
        return true;
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, 'families');
        toast.error('Gagal memperbarui keluarga.');
        return false;
      }
    }
    
    const isDuplicate = families.some(f => 
      f.name.toLowerCase() === nameToUse.trim().toLowerCase() && 
      f.ownerId === user.uid
    );
    
    if (isDuplicate) {
      toast.error('Keluarga dengan nama ini sudah ada.');
      return false;
    }

    try {
      // Create family document
      const familyRef = await addDoc(collection(db, 'families'), {
        name: nameToUse.trim(),
        ownerId: user.uid,
        createdAt: new Date().toISOString()
      });
      
      // Add creator as owner member with RBAC role
      await setDoc(doc(db, 'families', familyRef.id, 'members', user.uid), {
        role: 'owner',
        joinedAt: new Date().toISOString()
      });
      
      setNewFamilyName('');
      setShowFamilyModal(false);
      toast.success('Keluarga berhasil dibuat!');
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'families');
      toast.error('Gagal membuat keluarga.');
      return false;
    }
  }, [user, families, setNewFamilyName, setShowFamilyModal, setEditingFamily]);

  /**
   * Delete a family and all its members
   */
  const handleDeleteFamily = useCallback(async () => {
    if (!selectedFamily) return;
    try {
      const membersSnapshot = await getDocs(collection(db, 'families', selectedFamily.id, 'people'));
      const deletePromises = membersSnapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      await deleteDoc(doc(db, 'families', selectedFamily.id));
      setSelectedFamily(null);
      setShowDeleteConfirm(false);
      toast.success('Keluarga berhasil dihapus.');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `families/${selectedFamily.id}`);
      toast.error('Gagal menghapus keluarga.');
    }
  }, [selectedFamily, setSelectedFamily, setShowDeleteConfirm]);

  /**
   * Remove a collaborator from the selected family
   */
  const handleRemoveCollaborator = useCallback(async (collabUid: string) => {
    if (!selectedFamily || !user || selectedFamily.ownerId !== user.uid) return;
    try {
      const newCollabs = (selectedFamily.collaborators || []).filter(id => id !== collabUid);
      await updateDoc(doc(db, 'families', selectedFamily.id), {
        collaborators: newCollabs
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `families/${selectedFamily.id}`);
    }
  }, [selectedFamily, user]);

  // ============================================
  // MEMBER HANDLERS
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
    const { id, ...dataToSave } = memberData;

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
      // Use memberData.id to determine if this is an update or create
      const isEdit = !!(memberData.id && memberData.id.trim().length > 0);
      
      let memberId = isEdit ? memberData.id : undefined;
      
      if (isEdit) {
        const oldSpouseId = editingMember?.spouseId;
        const newSpouseId = memberData.spouseId;

        await updateDoc(doc(db, 'families', selectedFamily.id, 'people', memberId), {
          ...dataToSave,
          updatedAt: new Date().toISOString()
        });

        if (newSpouseId !== oldSpouseId) {
          if (oldSpouseId) {
            await updateDoc(doc(db, 'families', selectedFamily.id, 'people', oldSpouseId), {
              spouseId: '',
              updatedAt: new Date().toISOString()
            });
          }
          if (newSpouseId) {
            await updateDoc(doc(db, 'families', selectedFamily.id, 'people', newSpouseId), {
              spouseId: memberId,
              updatedAt: new Date().toISOString()
            });
          }
        }
      } else {
        const docRef = await addDoc(collection(db, 'families', selectedFamily.id, 'people'), {
          ...dataToSave,
          familyId: selectedFamily.id,
          createdBy: user.uid,
          updatedAt: new Date().toISOString()
        });
        memberId = docRef.id;

        if (memberData.spouseId) {
          await updateDoc(doc(db, 'families', selectedFamily.id, 'people', memberData.spouseId), {
            spouseId: memberId,
            updatedAt: new Date().toISOString()
          });
        }
      }
      
      toast.success(editingMember ? 'Data anggota diperbarui!' : 'Anggota baru ditambahkan!');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `families/${selectedFamily.id}/people`);
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
      if (memberToDelete?.spouseId) {
        await updateDoc(doc(db, 'families', selectedFamily.id, 'people', memberToDelete.spouseId), {
          spouseId: '',
          updatedAt: new Date().toISOString()
        });
      }
      await deleteDoc(doc(db, 'families', selectedFamily.id, 'people', memberId));
      toast.success('Anggota berhasil dihapus.');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `families/${selectedFamily.id}/members/${memberId}`);
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