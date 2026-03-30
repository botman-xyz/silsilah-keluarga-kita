/**
 * Generation Tree Component
 * Displays family members organized by generations (horizontal layout)
 */

import React, { useMemo } from 'react';
import { Member } from '../../types';
import { Users, ArrowRight, Crown } from 'lucide-react';
import { calculateAge } from '../../lib/utils';

interface GenTreeProps {
  members: Member[];
  onSelectMember?: (member: Member) => void;
}

// Helper function to get initials
const getInitials = (name: string): string => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

interface Generation {
  level: number;
  members: Member[];
  label: string;
}

export default function GenTree({ members, onSelectMember }: GenTreeProps) {
  // Group members by generation
  const generations = useMemo(() => {
    if (!members.length) return [];

    const memberIds = new Set(members.map(m => m.id));
    
    // Find root members (no parents in the list)
    const roots = members.filter(m => 
      (!m.fatherId || !memberIds.has(m.fatherId)) && 
      (!m.motherId || !memberIds.has(m.motherId))
    );

    const genMap = new Map<string, Member[]>();
    
    const assignGen = (memberId: string, level: number) => {
      const existing = genMap.get(`Gen ${level}`) || [];
      const member = members.find(m => m.id === memberId);
      if (!member) return;
      
      // Avoid duplicates
      if (!existing.find(m => m.id === memberId)) {
        genMap.set(`Gen ${level}`, [...existing, member]);
      }
      
      // Find children
      const children = members.filter(m => 
        m.fatherId === memberId || m.motherId === memberId
      );
      children.forEach(c => assignGen(c.id, level + 1));
    };

    roots.forEach(r => assignGen(r.id, 1));

    // Convert to array and sort
    return Object.entries(Object.fromEntries(genMap))
      .sort(([a], [b]) => {
        const genA = parseInt(a.replace('Gen ', ''));
        const genB = parseInt(b.replace('Gen ', ''));
        return genA - genB;
      })
      .map(([label, mems]) => ({
        level: parseInt(label.replace('Gen ', '')),
        members: mems.sort((a, b) => {
          // Sort by birth year, then by name
          const dateA = a.birthDate ? new Date(a.birthDate).getTime() : 0;
          const dateB = b.birthDate ? new Date(b.birthDate).getTime() : 0;
          return dateA - dateB || a.name.localeCompare(b.name);
        }),
        label
      }));
  }, [members]);

  if (!members.length) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Belum ada anggota keluarga</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 overflow-x-auto">
      <div className="min-w-max">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            Silsilah per Generasi
          </h2>
          <p className="text-slate-500 text-sm">
            {generations.length} generasi · {members.length} anggota keluarga
          </p>
        </div>

        {/* Generation Cards */}
        <div className="flex gap-4 pb-4">
          {generations.map((gen) => (
            <div 
              key={gen.level} 
              className="flex-shrink-0 w-64"
            >
              {/* Generation Header */}
              <div className={`
                px-4 py-2 rounded-t-xl text-center font-bold text-sm
                ${gen.level === 1 ? 'bg-amber-100 text-amber-800' : ''}
                ${gen.level === 2 ? 'bg-blue-100 text-blue-800' : ''}
                ${gen.level === 3 ? 'bg-green-100 text-green-800' : ''}
                ${gen.level >= 4 ? 'bg-purple-100 text-purple-800' : ''}
              `}>
                {gen.label} ({gen.members.length} orang)
              </div>

              {/* Members in Generation */}
              <div className="bg-white border border-t-0 border-slate-200 rounded-b-xl p-3 space-y-2">
                {gen.members.map(member => {
                  // Check if member is adopted child or has external family (mantu)
                  const isMantu = member.isAdoptedChild || !!member.externalFamilyId || !!member.externalSpouseName;
                  
                  return (
                  <button
                    key={member.id}
                    onClick={() => onSelectMember?.(member)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left group ${isMantu ? 'bg-amber-50' : ''}`}
                  >
                    {/* Avatar with badge for mantu */}
                    <div className="relative">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                        ${member.gender === 'male' ? 'bg-blue-100' : 'bg-pink-100'}
                      `}>
                        <span className={`
                          text-sm font-bold
                          ${member.gender === 'male' ? 'text-blue-700' : 'text-pink-700'}
                        `}>
                          {getInitials(member.name)}
                        </span>
                      </div>
                      {/* Badge for mantu */}
                      {isMantu && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center" title="Mantu ( Bukan Anak Kandung )">
                          <span className="text-[8px] font-bold text-white">M</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-800 text-sm truncate">
                        {member.name}
                        {isMantu && <span className="text-xs text-amber-600 ml-1">(Mantu)</span>}
                      </div>
                      <div className="text-xs text-slate-500">
                        {member.birthDate 
                          ? `${calculateAge(member.birthDate)} tahun` 
                          : 'Usia tidak diketahui'}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
                  </button>
                );})}
              </div>

              {/* Connector to next generation */}
              {gen.level < generations.length && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="w-5 h-5 text-slate-300 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
