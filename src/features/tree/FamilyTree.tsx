import React from 'react';
import { Member } from '../../domain/entities';
import { ReactFlowTree } from './ReactFlowTree';
import { MousePointer2 } from 'lucide-react';

interface FamilyTreeProps {
   members: Member[];
   searchTerm?: string;
   onSelectMember: (member: Member) => void;
   onAddRelative?: (member: Member) => void;
   onFamilySelect?: (familyId: string) => void;
   isHeaderHidden?: boolean;
   onToggleHeader?: () => void;
   treePov?: 'suami' | 'istri';
   onTogglePov?: (pov: 'suami' | 'istri') => void;
}

export default function FamilyTree({
   members,
   searchTerm = "",
   onSelectMember,
   onAddRelative,
   isHeaderHidden = false,
   onToggleHeader,
   treePov = 'suami',
   onTogglePov
}: FamilyTreeProps) {
  return (
    <div className="w-full h-full bg-slate-50 rounded-xl border border-slate-200 relative">
      <ReactFlowTree
        members={members}
        searchTerm={searchTerm}
        onSelectMember={onSelectMember}
        onAddRelative={onAddRelative}
        treePov={treePov}
      />
      
      {/* Tip */}
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2 pointer-events-none">
        <MousePointer2 className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[10px] font-medium text-slate-500">Geser & Zoom untuk navigasi</span>
      </div>
    </div>
  );
}
