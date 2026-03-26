import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Member, Family } from '../../types';
import { MemberForm } from '../../features/member/MemberForm';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: Partial<Member>) => void;
  editingMember: Member | null;
  members: Member[];
  allMembers: Member[];
  families: Family[];
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMember,
  members,
  allMembers,
  families,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full h-[90dvh] sm:h-auto sm:max-h-[100vh] sm:max-w-2xl flex flex-col"
          >
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl lg:text-2xl font-bold text-slate-900">
                {editingMember ? 'Edit Anggota' : 'Tambah Anggota'}
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <MemberForm
                initialData={editingMember || {}}
                members={members}
                allMembers={allMembers}
                families={families}
                onSave={onSave}
                onCancel={onClose}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
