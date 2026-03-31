/**
 * Generation Tree Component
 * Displays family members organized by generations (horizontal or vertical layout)
 */

import React, { useMemo, useState } from 'react';
import { Member } from '../../types';
import { Users, ArrowRight, Crown, Heart, Search, Filter, LayoutGrid, List } from 'lucide-react';
import { calculateAge, formatDate } from '../../lib/utils';

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

// Generation labels with meaningful names
const getGenLabel = (level: number): string => {
  const labels: Record<number, string> = {
    1: 'Generasi 1 (Pendiri)',
    2: 'Generasi 2',
    3: 'Generasi 3',
    4: 'Generasi 4',
    5: 'Generasi 5',
    6: 'Generasi 6',
    7: 'Generasi 7',
  };
  return labels[level] || `Generasi ${level}`;
};

export default function GenTree({ members, onSelectMember }: GenTreeProps) {
  const [selectedGen, setSelectedGen] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');

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
          const dateA = a.birthDate ? new Date(a.birthDate).getTime() : 0;
          const dateB = b.birthDate ? new Date(b.birthDate).getTime() : 0;
          return dateA - dateB || a.name.localeCompare(b.name);
        }),
        label: getGenLabel(parseInt(label.replace('Gen ', '')))
      }));
  }, [members]);

  // Filter members based on search
  const filteredGenerations = useMemo(() => {
    if (!searchTerm && selectedGen === null) return generations;
    
    return generations
      .map(gen => ({
        ...gen,
        members: gen.members.filter(m => 
          m.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }))
      .filter(gen => selectedGen === null || gen.level === selectedGen)
      .filter(gen => gen.members.length > 0);
  }, [generations, searchTerm, selectedGen]);

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

  // Color scheme for generations
  const genColors = [
    { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
    { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
    { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  ];

  const getGenColor = (level: number) => genColors[(level - 1) % genColors.length];

  // Render member card
  const renderMemberCard = (member: Member) => {
    const isMantu = member.isAdoptedChild || !!member.externalFamilyId || !!member.externalSpouseName;
    const spouse = members.find(m => m.id === member.spouseId);
    const childCount = members.filter(m => 
      m.fatherId === member.id || m.motherId === member.id
    ).length;

    return (
      <button
        key={member.id}
        onClick={() => onSelectMember?.(member)}
        className={`w-full flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left group ${isMantu ? 'bg-amber-50' : ''}`}
      >
        <div className="relative">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${member.gender === 'male' ? 'bg-blue-100' : 'bg-pink-100'}`}>
            <span className={`text-sm font-bold ${member.gender === 'male' ? 'text-blue-700' : 'text-pink-700'}`}>
              {getInitials(member.name)}
            </span>
          </div>
          {isMantu && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center" title="Mantu">
              <span className="text-[8px] font-bold text-white">M</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-800 text-sm truncate">
            {member.name}
            {isMantu && <span className="text-xs text-amber-600 ml-1">(Mantu)</span>}
          </div>
          {spouse && (
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
              <Heart className="w-3 h-3 text-pink-400" />
              <span className="truncate">{spouse.name}</span>
            </div>
          )}
          <div className="text-xs text-slate-400 mt-0.5">
            {member.birthDate 
              ? `${formatDate(member.birthDate)} (${calculateAge(member.birthDate)} tahun)`
              : 'Tanggal lahir tidak diketahui'}
            {member.deathDate && ` - Wafat: ${formatDate(member.deathDate)}`}
          </div>
          {childCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-blue-500 mt-1">
              <Users className="w-3 h-3" />
              {childCount} anak
            </div>
          )}
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 mt-2" />
      </button>
    );
  };

  // Render horizontal layout
  const renderHorizontalLayout = () => (
    <div className="flex gap-4 pb-4 overflow-x-auto">
      {filteredGenerations.map((gen) => {
        const colors = getGenColor(gen.level);
        return (
          <div key={gen.level} className="flex-shrink-0 w-72">
            <div className={`px-4 py-3 rounded-t-xl text-center font-bold text-sm ${colors.bg} ${colors.text}`}>
              <div className="flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" />
                {gen.label}
              </div>
              <div className="text-xs font-normal opacity-75 mt-1">{gen.members.length} anggota</div>
            </div>
            <div className={`bg-white border border-t-0 ${colors.border} rounded-b-xl p-3 space-y-2 max-h-[500px] overflow-y-auto`}>
              {gen.members.map(renderMemberCard)}
              {gen.members.length === 0 && <div className="text-center text-slate-400 text-sm py-4">Tidak ada anggota</div>}
            </div>
            {gen.level < generations.length && (
              <div className="flex justify-center py-2">
                <ArrowRight className="w-5 h-5 text-slate-300 rotate-90" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Render vertical layout
  const renderVerticalLayout = () => (
    <div className="space-y-6 pb-4">
      {filteredGenerations.map((gen) => {
        const colors = getGenColor(gen.level);
        return (
          <div key={gen.level} className="relative">
            {/* Generation Header */}
            <div className={`px-4 py-3 rounded-t-xl font-bold text-sm ${colors.bg} ${colors.text}`}>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                {gen.label} - {gen.members.length} anggota
              </div>
            </div>
            
            {/* Members in columns */}
            <div className={`bg-white border ${colors.border} rounded-b-xl p-4`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {gen.members.map(member => {
                  const isMantu = member.isAdoptedChild || !!member.externalFamilyId || !!member.externalSpouseName;
                  const spouse = members.find(m => m.id === member.spouseId);
                  const childCount = members.filter(m => m.fatherId === member.id || m.motherId === member.id).length;
                  
                  return (
                    <button
                      key={member.id}
                      onClick={() => onSelectMember?.(member)}
                      className={`flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all text-left ${isMantu ? 'bg-amber-50' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${member.gender === 'male' ? 'bg-blue-100' : 'bg-pink-100'}`}>
                        <span className={`text-xs font-bold ${member.gender === 'male' ? 'text-blue-700' : 'text-pink-700'}`}>
                          {getInitials(member.name)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-slate-800 truncate">
                          {member.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {member.birthDate ? calculateAge(member.birthDate) + ' th' : '-'}
                          {spouse && <span className="ml-1">💍</span>}
                          {childCount > 0 && <span className="ml-1">👶{childCount}</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {gen.members.length === 0 && (
                <div className="text-center text-slate-400 text-sm py-4">Tidak ada anggota</div>
              )}
            </div>
            
            {/* Connector to next generation */}
            {gen.level < generations.length && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10">
                <div className="w-px h-6 bg-slate-300" />
                <ArrowRight className="w-5 h-5 text-slate-300 -rotate-90 mx-auto" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-500" />
          Silsilah per Generasi
        </h2>
        <p className="text-slate-500 text-sm">
          {generations.length} generasi · {members.length} anggota keluarga
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari anggota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Generation Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedGen || ''}
            onChange={(e) => setSelectedGen(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Generasi</option>
            {generations.map(gen => (
              <option key={gen.level} value={gen.level}>{gen.label}</option>
            ))}
          </select>
        </div>

        {/* Layout Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setLayout('horizontal')}
            className={`p-2 rounded-lg transition-colors ${layout === 'horizontal' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            title="Tampilan Horizontal"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayout('vertical')}
            className={`p-2 rounded-lg transition-colors ${layout === 'vertical' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            title="Tampilan Vertikal"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {layout === 'horizontal' ? renderHorizontalLayout() : renderVerticalLayout()}
    </div>
  );
}
