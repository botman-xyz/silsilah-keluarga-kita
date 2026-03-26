import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit2 } from 'lucide-react';
import { Member } from '../../types';
import { MemberDetailView } from '../../features/member/MemberDetailView';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (member: Member) => void;
  member: Member | null;
  allMembers: Member[];
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  onEdit,
  member, 
  allMembers 
}) => {
  if (!isOpen || !member) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full h-[85dvh] sm:h-auto sm:max-w-xl sm:max-h-[100vh] flex flex-col"
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden" />
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Detail Anggota</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    onEdit(member);
                    onClose();
                  }}
                  className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <MemberDetailView 
                member={member} 
                allMembers={allMembers} 
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
