import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X } from 'lucide-react';
import { Member } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  extendedMembers: Member[];
  onSelectMember: (member: Member) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ 
  isOpen, 
  onClose, 
  searchTerm, 
  setSearchTerm, 
  extendedMembers, 
  onSelectMember 
}) => {
  const searchResults = searchTerm 
    ? extendedMembers.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent outline-none text-slate-900 font-medium"
              />
              <button 
                onClick={() => {
                  onClose();
                  setSearchTerm('');
                }}
                className="p-2 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            {searchTerm && (
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {searchResults.length > 0 ? (
                  searchResults.map(member => (
                    <button
                      key={member.id}
                      onClick={() => {
                        onSelectMember(member);
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-all text-left"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${member.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt={member.name} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          member.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{member.name}</div>
                        <div className="text-xs text-slate-500">
                          {member.birthDate ? `${new Date(member.birthDate).getFullYear()}${member.deathDate ? ` - ${new Date(member.deathDate).getFullYear()}` : ` (${Math.floor((new Date().getTime() - new Date(member.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} th)`}` : '?'} 
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Tidak ada anggota ditemukan</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
