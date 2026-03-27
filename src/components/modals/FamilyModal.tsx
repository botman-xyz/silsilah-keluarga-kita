import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Image } from 'lucide-react';
import { Family } from '../../types';
import { toast } from 'sonner';

interface FamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (familyName: string, kartuKeluargaUrl?: string) => void;
  initialFamilyName?: string;
  initialKartuKeluargaUrl?: string;
}

export const FamilyModal: React.FC<FamilyModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialFamilyName = '',
  initialKartuKeluargaUrl = '' 
}) => {
  const [familyName, setFamilyName] = useState(initialFamilyName);
  const [kartuKeluargaUrl, setKartuKeluargaUrl] = useState(initialKartuKeluargaUrl);
  const [kkFile, setKkFile] = useState<File | null>(null);
  const [kkPreview, setKkPreview] = useState<string | null>(null);

  useEffect(() => {
    setFamilyName(initialFamilyName);
    setKartuKeluargaUrl(initialKartuKeluargaUrl || '');
    setKkPreview(initialKartuKeluargaUrl || null);
  }, [initialFamilyName, initialKartuKeluargaUrl, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File terlalu besar. Maksimum 5MB.');
        return;
      }
      setKkFile(file);
      setKkPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    if (familyName.trim()) {
      // For now, we'll just pass the URL directly - in production you'd upload to storage
      const kkUrl = kkFile ? kkPreview : kartuKeluargaUrl;
      onSave(familyName.trim(), kkUrl || undefined);
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
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kartu Keluarga (Opsional)</label>
                {!kkPreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all">
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-xs text-slate-400">Klik untuk upload KK</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                ) : (
                  <div className="relative">
                    <img src={kkPreview} alt="Kartu Keluarga" className="w-full h-40 object-cover rounded-2xl border border-slate-200" />
                    <button 
                      onClick={() => { setKkFile(null); setKkPreview(null); }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
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