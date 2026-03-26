import React from 'react';
import { Member } from '../../types';
import { Users } from 'lucide-react';
import { calculateAge, formatDate } from '../../lib/utils';

interface MemberListProps {
  members: Member[];
  onSelectMember: (member: Member) => void;
}

export default function MemberList({ members, onSelectMember }: MemberListProps) {
  // DEBUG: Trace member list rendering
  console.log('[DEBUG] MemberList rendering with members:', members.length);
  members.forEach((m, i) => {
    console.log(`[DEBUG] Member ${i}:`, m.id, m.name);
  });

  const sortedMembers = [...members].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Users className="w-16 h-16 text-slate-200 mb-4" />
        <h3 className="text-lg font-bold text-slate-700 mb-2">Belum Ada Anggota</h3>
        <p className="text-slate-500 text-sm">Tambahkan anggota keluarga untuk melihat daftar mereka di sini.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 pb-24 min-h-full">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">Daftar Anggota Keluarga</h2>
        <p className="text-slate-500 mb-6">{members.length} anggota</p>
        
        <div className="space-y-3">
          {sortedMembers.map(member => {
            const age = calculateAge(member.birthDate, member.deathDate);
            
            return (
              <button
                key={member.id}
                onClick={() => onSelectMember(member)}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all text-left"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white ${member.gender === 'male' ? 'bg-blue-500' : member.gender === 'female' ? 'bg-pink-500' : 'bg-slate-400'}`}>
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.name} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    member.name.charAt(0).toUpperCase()
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate">{member.name}</div>
                  <div className="text-sm text-slate-500">
                    {member.gender === 'male' ? 'Laki-laki' : member.gender === 'female' ? 'Perempuan' : 'Lainnya'}
                    {age !== null && ` • ${age} tahun`}
                  </div>
                  {member.isAdoptedChild && (
                    <div className="text-xs text-amber-600 font-medium">Anak Angkat</div>
                  )}
                  {member.birthDate && (
                    <div className="text-xs text-slate-400">
                      Lahir: {formatDate(member.birthDate)}
                      {member.deathDate && ` • Wafat: ${formatDate(member.deathDate)}`}
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${member.maritalStatus === 'single' ? 'bg-slate-100 text-slate-600' : member.maritalStatus === 'married' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {member.maritalStatus === 'single' ? 'Lajang' : member.maritalStatus === 'married' ? 'Menikah' : member.maritalStatus === 'divorced' ? 'Cerai' : 'Janda/Duda'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
