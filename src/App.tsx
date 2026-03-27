import React, { useState, useEffect, useMemo } from 'react';
import { Family, Member, UserProfile } from './domain/entities';
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
import { useAppHandlers } from './presentation/hooks/useAppHandlers';

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
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
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

  // Extract handlers into custom hook
  const handlers = useAppHandlers({
    user,
    families,
    selectedFamily,
    allMembers,
    setSelectedFamily,
    setShowDeleteConfirm,
    setShowMemberModal,
    setEditingMember,
    setNewFamilyName: (name: string) => setNewFamilyName(name),
    setShowFamilyModal: (show: boolean) => setShowFamilyModal(show),
    setEditingFamily: (f: Family | null) => setEditingFamily(f),
    setSelectedMemberForDetail: (m: Member | null) => setSelectedMemberForDetail(m),
  });

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

  // Use handlers from the custom hook
  const { 
    handleAddFamily: handleAddFamilyHandler,
    handleDeleteFamily: handleDeleteFamilyHandler,
    handleRemoveCollaborator: handleRemoveCollaboratorHandler,
    handleViewMember: handleViewMemberHandler,
    handleQuickAddRelative: handleQuickAddRelativeHandler,
    handleSaveMember: handleSaveMemberHandler,
    handleDeleteMember: handleDeleteMemberHandler,
    checkDuplicates
  } = handlers;

  // Wrapper functions that call handlers with additional state
  const handleAddFamily = async (nameOverride?: string, kartuKeluargaUrl?: string) => {
    await handleAddFamilyHandler(nameOverride || newFamilyName, editingFamily, kartuKeluargaUrl);
    setNewFamilyName('');
    setEditingFamily(null);
    setShowFamilyModal(false);
  };

  const handleViewMember = (member: Member) => {
    handleViewMemberHandler(member);
  };

  const handleQuickAddRelative = (member: Member) => {
    handleQuickAddRelativeHandler(member);
  };

  const handleSaveMember = async (memberData: Partial<Member>) => {
    await handleSaveMemberHandler(memberData, editingMember);
    setShowMemberModal(false);
    setEditingMember(null);
  };

  const handleDeleteMember = async (memberId: string) => {
    await handleDeleteMemberHandler(memberId, members);
  };

  const handleDeleteFamily = async () => {
    await handleDeleteFamilyHandler();
  };

  const handleRemoveCollaborator = async (collabUid: string) => {
    await handleRemoveCollaboratorHandler(collabUid);
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
                  setEditingFamily(f);
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
              setEditingFamily(f);
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
                setEditingFamily(null);
              }}
              onSave={handleAddFamily}
              initialFamilyName={newFamilyName}
              initialKartuKeluargaUrl={editingFamily?.kartuKeluargaUrl}
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