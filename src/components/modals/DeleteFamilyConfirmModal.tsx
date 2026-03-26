import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2 } from 'lucide-react';
import { Family } from '../../types';

interface DeleteFamilyConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  familyName: string | undefined;
}

export const DeleteFamilyConfirmModal: React.FC<DeleteFamilyConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  familyName,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
          >
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Keluarga?</h3>
            <p className="text-slate-500 mb-8">
              Apakah Anda yakin ingin menghapus keluarga <span className="font-bold text-slate-700">"{familyName}"</span>? 
              Tindakan ini tidak dapat dibatalkan dan semua data anggota akan dihapus secara permanen.
            </p>
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-all"
              >
                Hapus Sekarang
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};