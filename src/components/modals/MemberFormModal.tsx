import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, Edit } from 'lucide-react';
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
  isLoading?: boolean;
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMember,
  members,
  allMembers,
  families,
  isLoading = false,
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
            className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full h-[95dvh] sm:h-auto sm:max-h-[95vh] sm:max-w-3xl flex flex-col"
          >
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-3xl sm:rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  editingMember 
                    ? 'bg-amber-100 text-amber-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {editingMember ? (
                    <Edit className="w-5 h-5" />
                  ) : (
                    <UserPlus className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-slate-900">
                    {editingMember ? 'Edit Anggota' : 'Tambah Anggota'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {editingMember 
                      ? 'Perbarui informasi anggota keluarga' 
                      : 'Tambahkan anggota keluarga baru'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                disabled={isLoading}
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <MemberForm
                initialData={editingMember || {}}
                members={members}
                allMembers={allMembers}
                families={families}
                onSave={onSave}
                onCancel={onClose}
                isLoading={isLoading}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
