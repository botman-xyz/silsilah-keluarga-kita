import React, { useState, useMemo } from 'react';
import { Member } from '../../types';
import { Search, Users, ArrowRight, Info, History } from 'lucide-react';
import { motion } from 'motion/react';

interface RelationshipCalculatorProps {
  members: Member[];
}

export default function RelationshipCalculator({ members }: RelationshipCalculatorProps) {
  const [member1Id, setMember1Id] = useState('');
  const [member2Id, setMember2Id] = useState('');
  const [searchTerm1, setSearchTerm1] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');

  const filteredMembers1 = useMemo(() => 
    members.filter(m => m.name.toLowerCase().includes(searchTerm1.toLowerCase())).slice(0, 5),
    [members, searchTerm1]
  );

  const filteredMembers2 = useMemo(() => 
    members.filter(m => m.name.toLowerCase().includes(searchTerm2.toLowerCase())).slice(0, 5),
    [members, searchTerm2]
  );

  const calculateRelationship = () => {
    if (!member1Id || !member2Id) return null;
    if (member1Id === member2Id) return { label: "Orang yang sama", path: [] };

    const m1 = members.find(m => m.id === member1Id);
    const m2 = members.find(m => m.id === member2Id);
    if (!m1 || !m2) return null;

    // Build a graph of relationships
    const graph = new Map<string, Set<string>>();
    members.forEach(m => {
      if (!graph.has(m.id)) graph.set(m.id, new Set());
      
      if (m.fatherId) {
        if (!graph.has(m.fatherId)) graph.set(m.fatherId, new Set());
        graph.get(m.id)!.add(m.fatherId);
        graph.get(m.fatherId)!.add(m.id);
      }
      if (m.motherId) {
        if (!graph.has(m.motherId)) graph.set(m.motherId, new Set());
        graph.get(m.id)!.add(m.motherId);
        graph.get(m.motherId)!.add(m.id);
      }
      if (m.spouseId) {
        if (!graph.has(m.spouseId)) graph.set(m.spouseId, new Set());
        graph.get(m.id)!.add(m.spouseId);
        graph.get(m.spouseId)!.add(m.id);
      }
    });

    // BFS to find shortest path
    const queue: [string, string[]][] = [[m1.id, []]];
    const visited = new Set<string>([m1.id]);
    
    while (queue.length > 0) {
      const [currentId, path] = queue.shift()!;
      if (currentId === m2.id) {
        const fullPath = [...path, currentId];
        const pathMembers = fullPath.map(id => members.find(m => m.id === id)!);
        return {
          label: describePath(path, m1, m2, members),
          path: pathMembers
        };
      }

      const neighbors = graph.get(currentId) || new Set();
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push([neighborId, [...path, currentId]]);
        }
      }
    }

    return { label: "Hubungan Jauh atau Belum Terhubung", path: [] };
  };

  const describePath = (path: string[], start: Member, end: Member, all: Member[]) => {
    const distance = path.length;
    
    // Direct relationships
    if (distance === 1) {
      if (start.fatherId === end.id || start.motherId === end.id) return `${end.name} adalah Orang Tua dari ${start.name}`;
      if (end.fatherId === start.id || end.motherId === start.id) return `${start.name} adalah Orang Tua dari ${end.name}`;
      if (start.spouseId === end.id) return "Suami/Istri";
      if (start.fatherId === end.fatherId && start.motherId === end.motherId) return "Saudara Kandung";
    }

    // Grandparents
    if (distance === 2) {
      const mid = all.find(m => m.id === path[1]);
      if (mid && (start.fatherId === mid.id || start.motherId === mid.id) && (mid.fatherId === end.id || mid.motherId === end.id)) {
        return `${end.name} adalah Kakek/Nenek dari ${start.name}`;
      }
      if (mid && (end.fatherId === mid.id || end.motherId === mid.id) && (mid.fatherId === start.id || mid.motherId === start.id)) {
        return `${start.name} adalah Kakek/Nenek dari ${end.name}`;
      }
    }

    // Uncles/Aunts / Nephews/Nieces
    if (distance === 2) {
      const mid = all.find(m => m.id === path[1]);
      if (mid) {
        // Uncle/Aunt: mid is parent of start, end is sibling of mid
        if ((start.fatherId === mid.id || start.motherId === mid.id) && 
            ((mid.fatherId && mid.fatherId === end.fatherId) || (mid.motherId && mid.motherId === end.motherId))) {
          return `${end.name} adalah Paman/Bibi dari ${start.name}`;
        }
        // Nephew/Niece: start is sibling of mid, mid is parent of end
        if (((start.fatherId && start.fatherId === mid.fatherId) || (start.motherId && start.motherId === mid.motherId)) &&
            (end.fatherId === mid.id || end.motherId === mid.id)) {
          return `${end.name} adalah Keponakan dari ${start.name}`;
        }
      }
    }

    // Cousins
    if (distance === 3) {
      const mid1 = all.find(m => m.id === path[1]);
      const mid2 = all.find(m => m.id === path[2]);
      if (mid1 && mid2) {
        // Cousins: mid1 is parent of start, mid2 is parent of end, mid1 and mid2 are siblings
        if ((start.fatherId === mid1.id || start.motherId === mid1.id) &&
            (end.fatherId === mid2.id || end.motherId === mid2.id) &&
            ((mid1.fatherId && mid1.fatherId === mid2.fatherId) || (mid1.motherId && mid1.motherId === mid2.motherId))) {
          return "Sepupu";
        }
      }
    }

    return `Terhubung melalui ${distance} tingkatan silsilah`;
  };

  const result = calculateRelationship();

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Kalkulator Hubungan</h2>
            <p className="text-xs sm:text-sm text-slate-500">Cari tahu bagaimana dua orang saling terhubung.</p>
          </div>
          <button 
            onClick={() => {
              setMember1Id('');
              setMember2Id('');
              setSearchTerm1('');
              setSearchTerm2('');
            }}
            className="ml-auto p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            title="Reset"
          >
            <History className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 relative">
          {/* Connector Arrow */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-slate-100 rounded-full items-center justify-center shadow-sm z-10">
            <ArrowRight className="w-4 h-4 text-slate-300" />
          </div>

          {/* Member 1 Selection */}
          <div className="space-y-4">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Orang Pertama</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari nama..."
                value={searchTerm1}
                onChange={(e) => setSearchTerm1(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              {filteredMembers1.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setMember1Id(m.id); setSearchTerm1(m.name); }}
                  className={`w-full p-3 rounded-xl text-left text-sm font-medium transition-all ${member1Id === m.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border border-slate-100 text-slate-600 hover:border-blue-200'}`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Member 2 Selection */}
          <div className="space-y-4">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Orang Kedua</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari nama..."
                value={searchTerm2}
                onChange={(e) => setSearchTerm2(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              {filteredMembers2.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setMember2Id(m.id); setSearchTerm2(m.name); }}
                  className={`w-full p-3 rounded-xl text-left text-sm font-medium transition-all ${member2Id === m.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border border-slate-100 text-slate-600 hover:border-blue-200'}`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl text-center">
              <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Hasil Analisis</div>
              <div className="text-xl font-bold text-slate-900">{result.label}</div>
            </div>

            {result.path.length > 2 && (
              <div className="space-y-4">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Jalur Hubungan</div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {result.path.map((m, i) => (
                    <React.Fragment key={m.id}>
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${m.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                          {m.photoUrl ? (
                            <img src={m.photoUrl} alt={m.name} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            m.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 max-w-[60px] truncate">{m.name}</span>
                      </div>
                      {i < result.path.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {!result && member1Id && member2Id && (
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-slate-500 text-sm">
            <Info className="w-4 h-4" />
            Pilih dua orang yang berbeda untuk melihat hubungan mereka.
          </div>
        )}
      </div>
    </div>
  );
}
