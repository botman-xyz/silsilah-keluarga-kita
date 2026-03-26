import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Family, UserProfile } from '../../types';
import { toast } from 'sonner';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFamily: Family | null;
  user: UserProfile | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, selectedFamily, user }) => {
  const [collaboratorEmail, setCollaboratorEmail] = useState('');

  const handleAddCollaborator = async () => {
    if (!selectedFamily || !collaboratorEmail || !user) return;
    if (collaboratorEmail === user.uid) {
      toast.error("Anda tidak bisa menambahkan diri sendiri sebagai kolaborator.");
      return;
    }
    if (selectedFamily.collaborators?.includes(collaboratorEmail)) {
      toast.error("Pengguna ini sudah menjadi kolaborator.");
      return;
    }
    try {
      await updateDoc(doc(db, 'families', selectedFamily.id), {
        collaborators: [...(selectedFamily.collaborators || []), collaboratorEmail]
      });
      onClose();
      setCollaboratorEmail('');
      toast.success('Kolaborator berhasil ditambahkan!');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `families/${selectedFamily.id}`);
      toast.error('Gagal menambahkan kolaborator.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md sm:max-h-[100vh] p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Bagikan Keluarga</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Masukkan User ID (UID) teman atau keluarga Anda untuk berkolaborasi. 
              Mereka dapat menemukan UID mereka di bagian profil di pojok kiri bawah aplikasi.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">User ID (UID)</label>
                <input 
                  type="text" 
                  value={collaboratorEmail}
                  onChange={(e) => setCollaboratorEmail(e.target.value)}
                  placeholder="Masukkan UID..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <button 
                onClick={handleAddCollaborator}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
              >
                Tambah Kolaborator
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
