import React from 'react';
import { Member } from '../../types';
import { Heart, ImageIcon, FileText, ExternalLink } from 'lucide-react';
import { calculateAge, formatDate } from '../../lib/utils';

interface MemberDetailViewProps {
  member: Member;
  allMembers: Member[];
}

export function MemberDetailView({ member, allMembers }: MemberDetailViewProps) {
  const father = allMembers.find(m => m.id === member.fatherId);
  const mother = allMembers.find(m => m.id === member.motherId);
  const currentSpouse = allMembers.find(m => m.id === member.spouseId);
  const children = allMembers.filter(m => m.fatherId === member.id || m.motherId === member.id);
  const historicalSpouses = (member.spouseIds || [])
    .filter(id => id !== member.spouseId)
    .map(id => allMembers.find(m => m.id === id))
    .filter(Boolean) as Member[];

  const age = calculateAge(member.birthDate, member.deathDate);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center text-4xl font-bold text-white shadow-xl ${member.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
          {member.photoUrl ? (
            <img src={member.photoUrl} alt={member.name} className="w-full h-full rounded-3xl object-cover" referrerPolicy="no-referrer" />
          ) : (
            member.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
            {member.name}
            {(member.isAdoptedChild || member.externalFamilyId || member.externalSpouseName) && (
              <span className="ml-2 text-sm text-amber-600 font-medium">(Mantu)</span>
            )}
          </h2>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${member.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
              {member.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
              {member.maritalStatus === 'single' ? 'Lajang' : 
               member.maritalStatus === 'married' ? 'Menikah' : 
               member.maritalStatus === 'divorced' ? 'Cerai' : 'Janda/Duda'}
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            {member.birthDate ? `Lahir: ${new Date(member.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}${age !== null ? ` (${age} tahun)` : ''}` : 'Tanggal lahir tidak diketahui'}
            {member.deathDate && ` • Wafat: ${new Date(member.deathDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          </p>
        </div>
      </div>

      {member.bio && (
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Biografi</h4>
          <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
            "{member.bio}"
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Orang Tua</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">A</div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Ayah</div>
                <div className="text-sm font-bold text-slate-700">{father?.name || 'Tidak diketahui'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold">I</div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Ibu</div>
                <div className="text-sm font-bold text-slate-700">{mother?.name || 'Tidak diketahui'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Pasangan</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-2xl">
              <Heart className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-[10px] text-blue-600 font-bold uppercase">Pasangan Saat Ini</div>
                <div className="text-sm font-bold text-slate-700">{currentSpouse?.name || member.externalSpouseName || 'Tidak ada'}</div>
              </div>
            </div>
            {historicalSpouses.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] text-slate-400 font-bold uppercase px-1">Mantan Pasangan</div>
                {historicalSpouses.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl opacity-70">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold">{s.name.charAt(0)}</div>
                    <div className="text-xs font-medium text-slate-600">{s.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {children.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Anak-anak ({children.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {children.map(c => (
              <div key={c.id} className="p-3 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${c.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'}`}>
                  {c.name.charAt(0)}
                </div>
                <div className="text-xs font-bold text-slate-700 truncate">{c.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {member.media && member.media.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Arsip & Galeri ({member.media.length})</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {member.media.map((item, idx) => (
              <a 
                key={idx} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.type === 'image' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                  {item.type === 'image' ? <ImageIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-700 truncate">{item.name}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.type === 'image' ? 'Gambar' : 'Dokumen'}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
