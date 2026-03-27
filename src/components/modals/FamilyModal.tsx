import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Family } from '../../types';

interface FamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (familyName: string) => void;
  initialFamilyName?: string;
}

export const FamilyModal: React.FC<FamilyModalProps> = ({ isOpen, onClose, onSave, initialFamilyName = '' }) => {
  const [familyName, setFamilyName] = useState(initialFamilyName);

  useEffect(() => {
    setFamilyName(initialFamilyName);
  }, [initialFamilyName, isOpen]);

  const handleSave = () => {
    if (familyName.trim()) {
      onSave(familyName.trim());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-none sm:rounded-3xl shadow-2xl w-full h-full sm:h-auto sm:max-h-screen sm:max-w-md p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">{initialFamilyName ? 'Edit Keluarga' : 'Keluarga Baru'}</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Keluarga</label>
                <input 
                  type="text" 
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Contoh: Keluarga Besar Sudirman"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <button 
                onClick={handleSave}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
              >
                Simpan Keluarga
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};