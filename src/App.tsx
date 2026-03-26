import React, { useState, useEffect, useMemo } from 'react';
import { auth, db, signInWithGoogle, logout, onAuthStateChanged, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, setDoc, Timestamp, handleFirestoreError, OperationType, User } from './firebase';
import { Family, Member, UserProfile } from './types';
import { useAuth, useFamilies, useMembers } from './presentation/hooks';
import { isDuplicateMember } from './lib/utils';
import { Plus, LogOut, Users, Trash2, Edit2, Share2, Search, Scan, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';

// Features
import { Header } from './features/ui/Header';
import { Sidebar } from './features/ui/Sidebar';
import { ScanKKModal } from './features/ai/ScanKKModal';
import { KinshipDictionaryModal } from './features/ai/KinshipDictionaryModal';

// Components
import { ErrorBoundary } from './components/ErrorBoundary';
import { handlePrint } from './utils/printHelpers';
import { handleImportJSON, exportAllData, deleteAllData } from './utils/dataHelpers';

// Presentation Views
import { AuthView } from './presentation/views/AuthView';
import { MainContent } from './presentation/views/MainContent';

// Modal Components
import { FamilyModal } from './components/modals/FamilyModal';
import { ShareModal } from './components/modals/ShareModal';
import { SearchModal } from './components/modals/SearchModal';
import { MemberDetailModal } from './components/modals/MemberDetailModal';
import { MemberFormModal } from './components/modals/MemberFormModal';
import { HelpModal } from './components/modals/HelpModal';
import { DeleteFamilyConfirmModal } from './components/modals/DeleteFamilyConfirmModal';

export default function App() {
  // Data hooks (Clean Architecture)
  const { user, isAuthReady, signInWithGoogle, signOut } = useAuth();
  const { families, selectedFamily, setSelectedFamily } = useFamilies({ 
    userId: user?.uid 
  });
  const { allMembers } = useMembers({ families });

  // UI State only
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showScanKKModal, setShowScanKKModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<Member | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'stats' | 'timeline' | 'calculator' | 'story' | 'list'>('tree');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showKinshipModal, setShowKinshipModal] = useState(false);

  // Extended members for the tree
  const extendedMembers = useMemo(() => {
    if (!selectedFamily) return [];
    
    const familyMembers = allMembers.filter(m => m.familyId === selectedFamily.id);
    const linkedIds = new Set<string>();
    
    familyMembers.forEach(m => {
      if (m.fatherId) linkedIds.add(m.fatherId);
      if (m.motherId) linkedIds.add(m.motherId);
      if (m.spouseId) linkedIds.add(m.spouseId);
    });
    
    const linkedMembers = allMembers.filter(m => 
      m.familyId !== selectedFamily.id && (
        (m.fatherId && familyMembers.some(fm => fm.id === m.fatherId)) ||
        (m.motherId && familyMembers.some(fm => fm.id === m.motherId)) ||
        (m.spouseId && familyMembers.some(fm => fm.id === m.spouseId)) ||
        linkedIds.has(m.id)
      )
    );
    
    const combined = [...familyMembers, ...linkedMembers];
    const uniqueMap = new Map<string, Member>();
    combined.forEach(m => {
      const key = `${m.name.toLowerCase().trim()}|${m.birthDate || ''}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, m);
      }
    });
    
    return Array.from(uniqueMap.values());
  }, [selectedFamily, allMembers]);

  const members = selectedFamily 
    ? allMembers.filter(m => m.familyId === selectedFamily.id)
    : [];

  const handleAddFamily = async (nameOverride?: string) => {
    const nameToUse = nameOverride || newFamilyName;
    if (!user || !nameToUse) return;
    
    const isDuplicate = families.some(f => 
      f.name.toLowerCase() === nameToUse.trim().toLowerCase() && 
      f.ownerId === user.uid
    );
    
    if (isDuplicate) {
      toast.error('Keluarga dengan nama ini sudah ada.');
      return;
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
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'families');
      toast.error('Gagal membuat keluarga.');
    }
  };

  const handleViewMember = (member: Member) => {
    console.log('handleViewMember called with:', member);
    setSelectedMemberForDetail(member);
  };

  const handleQuickAddRelative = (member: Member) => {
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
  };

  const checkDuplicates = () => {
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
  };

  const handleSaveMember = async (memberData: Partial<Member>) => {
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
      // Ensure it's not just an empty string
      const isEdit = !!(memberData.id && memberData.id.trim().length > 0);
      console.log('[DEBUG] isEdit:', isEdit, 'memberData.id:', memberData.id);
      
      let memberId = isEdit ? memberData.id : undefined;
      
      if (isEdit) {
        console.log('[DEBUG] Updating existing member:', memberId);
        const oldSpouseId = editingMember?.spouseId;
        const newSpouseId = memberData.spouseId;

        // Use memberId (from memberData.id) instead of editingMember.id
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
              spouseId: memberId,  // Use memberId instead of editingMember.id
              updatedAt: new Date().toISOString()
            });
          }
        }
      } else {
        console.log('[DEBUG] Creating new member');
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
      setShowMemberModal(false);
      setEditingMember(null);
      toast.success(editingMember ? 'Data anggota diperbarui!' : 'Anggota baru ditambahkan!');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `families/${selectedFamily.id}/people`);
      toast.error('Gagal menyimpan data anggota.');
    }
  };
  
  const handleDeleteMember = async (memberId: string) => {
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
  };

  const handleDeleteFamily = async () => {
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
  };

  const handleRemoveCollaborator = async (collabUid: string) => {
    if (!selectedFamily || !user || selectedFamily.ownerId !== user.uid) return;
    try {
      const newCollabs = (selectedFamily.collaborators || []).filter(id => id !== collabUid);
      await updateDoc(doc(db, 'families', selectedFamily.id), {
        collaborators: newCollabs
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `families/${selectedFamily.id}`);
    }
  };

  const authFlow = (
    <AuthView
      isAuthReady={isAuthReady}
      user={user}
      familiesCount={families.length}
      onLogin={signInWithGoogle}
      onLogout={signOut}
      onAddFirstFamily={(name) => handleAddFamily(name)}
    />
  );

  if (!isAuthReady || !user || families.length === 0) {
    return authFlow;
  }

  return (
    <ErrorBoundary>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-slate-50 flex lg:flex-row overflow-hidden prevent-overflow">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 text-white shadow-2xl"
            >
              <Sidebar 
                isSidebarCollapsed={false}
                setIsSidebarCollapsed={() => {}}
                families={families}
                selectedFamily={selectedFamily}
                setSelectedFamily={(f) => { setSelectedFamily(f); setIsMobileSidebarOpen(false); }}
                members={members}
                extendedMembers={extendedMembers}
                user={user}
                onLogout={signOut}
                onAddFamily={() => { setShowFamilyModal(true); setIsMobileSidebarOpen(false); }}
                onEditFamily={(f) => {
                  setNewFamilyName(f.name);
                  setShowFamilyModal(true);
                  setIsMobileSidebarOpen(false);
                }}
                onDeleteFamily={() => setShowDeleteConfirm(true)}
                onShare={() => { setShowShareModal(true); setIsMobileSidebarOpen(false); }}
                viewMode={viewMode}
                setViewMode={(v) => { setViewMode(v); setIsMobileSidebarOpen(false); }}
                onMemberClick={(m) => { handleViewMember(m); setIsMobileSidebarOpen(false); }}
                onCheckDuplicates={checkDuplicates}
                onImportJSON={() => handleImportJSON(user, () => {})}
              />
            </motion.div>
          </div>
        )}

        {/* Desktop Sidebar - visible on md+ */}
        <div className="hidden md:block">
          <Sidebar 
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
            families={families}
            selectedFamily={selectedFamily}
            setSelectedFamily={setSelectedFamily}
            members={members}
            extendedMembers={extendedMembers}
            user={user}
            onLogout={signOut}
            onAddFamily={() => setShowFamilyModal(true)}
            onEditFamily={(f) => {
              setNewFamilyName(f.name);
              setShowFamilyModal(true);
            }}
            onDeleteFamily={() => setShowDeleteConfirm(true)}
            onShare={() => setShowShareModal(true)}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onMemberClick={handleViewMember}
            onCheckDuplicates={checkDuplicates}
            onImportJSON={() => handleImportJSON(user, () => {})}
          />
        </div>

        <main className="flex-1 flex flex-col h-dvh md:h-screen overflow-auto relative">
          <Header 
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
            isMobileSidebarOpen={isMobileSidebarOpen}
            onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            isHeaderHidden={isHeaderHidden}
            setIsHeaderHidden={setIsHeaderHidden}
            selectedFamily={selectedFamily}
            user={user}
            onSearchOpen={() => setIsSearchOpen(true)}
            onAddMember={() => { setEditingMember(null); setShowMemberModal(true); }}
            onShare={() => setShowShareModal(true)}
            onHelp={() => setShowHelpModal(true)}
            onKinship={() => setShowKinshipModal(true)}
            onPrint={() => handlePrint(selectedFamily?.name || 'Silsilah')}
          />
          <MainContent
            viewMode={viewMode}
            selectedFamily={selectedFamily}
            families={families}
            members={members}
            allMembers={allMembers}
            extendedMembers={extendedMembers}
            searchTerm={searchTerm}
            isHeaderHidden={isHeaderHidden}
            onSelectMember={handleViewMember}
            onAddRelative={handleQuickAddRelative}
            onFamilySelect={(id) => {
              const fam = families.find(f => f.id === id);
              if (fam) setSelectedFamily(fam);
            }}
            onToggleHeader={() => setIsHeaderHidden(!isHeaderHidden)}
            onShowFamilyModal={() => setShowFamilyModal(true)}
          />
        </main>

        {/* Modals */}
        <AnimatePresence>
          {showFamilyModal && (
            <FamilyModal
              isOpen={showFamilyModal}
              onClose={() => {
                setShowFamilyModal(false);
                setNewFamilyName('');
              }}
              onSave={handleAddFamily}
              initialFamilyName={newFamilyName}
            />
          )}

          {showShareModal && (
            <ShareModal
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
              selectedFamily={selectedFamily}
              user={user}
            />
          )}

          {isSearchOpen && (
            <SearchModal
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              extendedMembers={extendedMembers}
              onSelectMember={(member) => {
                setEditingMember(member);
                setShowMemberModal(true);
                setIsSearchOpen(false);
              }}
            />
          )}

          {selectedMemberForDetail && (
            <MemberDetailModal
              isOpen={!!selectedMemberForDetail}
              onClose={() => setSelectedMemberForDetail(null)}
              member={selectedMemberForDetail}
              allMembers={allMembers}
              onEdit={(member) => {
                console.log('MemberDetailModal onEdit called with:', member);
                setEditingMember(member);
                setShowMemberModal(true);
              }}
            />
          )}

          {showMemberModal && (
            <MemberFormModal
              isOpen={showMemberModal}
              onClose={() => { setShowMemberModal(false); setEditingMember(null); }}
              onSave={handleSaveMember}
              editingMember={editingMember}
              members={members}
              allMembers={allMembers}
              families={families}
            />
          )}

          {showScanKKModal && (
            <ScanKKModal 
              onClose={() => setShowScanKKModal(false)}
              onDataExtracted={async (extractedMembers) => {
                if (!selectedFamily) {
                  toast.error("Pilih keluarga terlebih dahulu!");
                  return;
                }
                
                const loadingToast = toast.loading(`Menyimpan ${extractedMembers.length} anggota keluarga...`);
                try {
                  for (const m of extractedMembers) {
                    await handleSaveMember(m);
                  }
                  toast.dismiss(loadingToast);
                  toast.success(`Berhasil menambahkan ${extractedMembers.length} anggota keluarga dari KK!`);
                  setShowScanKKModal(false);
                } catch (error) {
                  toast.dismiss(loadingToast);
                  toast.error("Gagal menyimpan beberapa anggota keluarga.");
                }
              }}
            />
          )}

          {showHelpModal && (
            <HelpModal
              isOpen={showHelpModal}
              onClose={() => setShowHelpModal(false)}
              onExport={() => exportAllData(families, allMembers)}
              onImport={() => handleImportJSON(user, () => setShowHelpModal(false))}
              onScan={() => setShowScanKKModal(true)}
              onDeleteAll={() => deleteAllData(user, families, () => {
                setShowHelpModal(false);
                setSelectedFamily(null);
              })}
            />
          )}

          {showDeleteConfirm && (
            <DeleteFamilyConfirmModal
              isOpen={showDeleteConfirm}
              onClose={() => setShowDeleteConfirm(false)}
              onConfirm={handleDeleteFamily}
              familyName={selectedFamily?.name}
            />
          )}

          {showKinshipModal && (
            <KinshipDictionaryModal onClose={() => setShowKinshipModal(false)} />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}