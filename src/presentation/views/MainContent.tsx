import React from 'react';
import { Family, Member } from '../../types';
import FamilyTree from '../../features/tree/FamilyTree';
import GenTree from '../../features/family/GenTree';
import FamilyStats from '../../features/family/FamilyStats';
import FamilyTimeline from '../../features/family/FamilyTimeline';
import RelationshipCalculator from '../../features/family/RelationshipCalculator';
import FamilyStory from '../../features/family/FamilyStory';
import MemberList from '../../features/member/MemberList';
import { Users } from 'lucide-react';

interface MainContentProps {
  viewMode: 'tree' | 'gentree' | 'stats' | 'timeline' | 'calculator' | 'story' | 'list';
  selectedFamily: Family | null;
  families: Family[];
  members: Member[];
  allMembers: Member[];
  extendedMembers: Member[];
  searchTerm: string;
  isHeaderHidden: boolean;
  treePov: 'suami' | 'istri';
  onSelectMember: (member: Member) => void;
  onAddRelative: (member: Member) => void;
  onFamilySelect: (id: string) => void;
  onToggleHeader: () => void;
  onShowFamilyModal: () => void;
}

export const MainContent: React.FC<MainContentProps> = ({
  viewMode,
  selectedFamily,
  families,
  members,
  allMembers,
  extendedMembers,
  searchTerm,
  isHeaderHidden,
  treePov,
  onSelectMember,
  onAddRelative,
  onFamilySelect,
  onToggleHeader,
  onShowFamilyModal,
}) => {
  if (!selectedFamily) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
          <Users className="text-slate-300 w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Belum Ada Keluarga Terpilih</h2>
        <p className="text-slate-500 max-w-md mb-8">Pilih keluarga dari sidebar atau buat keluarga baru untuk mulai membangun silsilah.</p>
        <button 
          onClick={onShowFamilyModal}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          Buat Keluarga Baru
        </button>
      </div>
    );
  }

  const renderViewModeContent = () => {
    switch (viewMode) {
      case 'tree':
        return (
          <div className="h-full relative overflow-hidden">
            <FamilyTree 
              members={extendedMembers} 
              searchTerm={searchTerm}
              onSelectMember={onSelectMember} 
              onAddRelative={onAddRelative}
              onFamilySelect={onFamilySelect}
              isHeaderHidden={isHeaderHidden}
              onToggleHeader={onToggleHeader}
              treePov={treePov}
            />
          </div>
        );
      case 'gentree':
        return (
          <GenTree 
            members={members}
            onSelectMember={onSelectMember}
          />
        );
      case 'stats':
        return <FamilyStats members={members} />;
      case 'list':
        return <MemberList members={members} onSelectMember={onSelectMember} />;
      case 'timeline':
        return <FamilyTimeline members={members} />;
      case 'calculator':
        return <RelationshipCalculator members={allMembers} />;
      default:
        return <FamilyStory family={selectedFamily} members={members} />;
    }
  };

  return <div className="flex-1 relative overflow-auto mobile-scroll">{renderViewModeContent()}</div>;
};