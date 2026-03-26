import { motion } from 'motion/react';
import { X, Search } from 'lucide-react';
import { Member } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  members: Member[];
  onMemberSelect: (member: Member) => void;
}

export function SearchModal({ 
  isOpen, 
  onClose, 
  searchTerm, 
  onSearchChange, 
  members,
  onMemberSelect 
}: SearchModalProps) {
  if (!isOpen) return null;

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm p-4 flex items-start justify-center pt-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-4 flex items-center gap-3 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            autoFocus
            type="text" 
            placeholder="Cari anggota keluarga..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent outline-none text-slate-900 font-medium"
          />
          <button 
            onClick={() => { onClose(); onSearchChange(''); }}
            className="p-2 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        {searchTerm && (
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredMembers.length > 0 ? (
              filteredMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => {
                    onMemberSelect(member);
                    onClose();
                    onSearchChange('');
                  }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors text-left"
                >
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{member.name}</p>
                    <p className="text-sm text-slate-500">
                      {member.birthDate ? `${new Date(member.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} (${Math.floor((new Date().getTime() - new Date(member.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} tahun)` : 'Tanggal lahir tidak diketahui'}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                Tidak ada anggota keluarga yang ditemukan
              </div>
            )}
          </div>
        )}
        
        {!searchTerm && (
          <div className="p-8 text-center text-slate-500">
            Mulai mengetik untuk mencari anggota keluarga
          </div>
        )}
      </motion.div>
    </div>
  );
}
