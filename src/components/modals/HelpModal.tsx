import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Share2, Download, FileUp, Scan, Trash2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
  onScan: () => void;
  onDeleteAll: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  onExport,
  onImport,
  onScan,
  onDeleteAll,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Panduan Penggunaan</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <section>
                <h4 className="font-bold text-slate-900 mb-2">1. Membuat Keluarga</h4>
                <p className="text-sm text-slate-600">Klik ikon <Plus className="w-3 h-3 inline" /> di sidebar untuk membuat grup keluarga baru. Anda bisa memiliki banyak grup keluarga (misal: Keluarga Besar Ayah, Keluarga Besar Ibu).</p>
              </section>
              <section>
                <h4 className="font-bold text-slate-900 mb-2">2. Menambah Anggota</h4>
                <p className="text-sm text-slate-600">Pilih keluarga, lalu klik tombol "Tambah" di kanan atas. Masukkan informasi dasar dan tentukan hubungan (Ayah/Ibu/Pasangan). Sistem akan otomatis membangun pohon silsilah.</p>
              </section>
              <section>
                <h4 className="font-bold text-slate-900 mb-2">3. Menghubungkan Antar Keluarga</h4>
                <p className="text-sm text-slate-600">Jika ada anggota keluarga yang menikah dengan anggota dari grup keluarga lain yang Anda kelola, Anda bisa memilih "Dari Keluarga Lain" pada pilihan Ayah/Ibu/Pasangan.</p>
              </section>
              <section>
                <h4 className="font-bold text-slate-900 mb-2">4. Kolaborasi</h4>
                <p className="text-sm text-slate-600">Klik ikon <Share2 className="w-3 h-3 inline" /> untuk membagikan keluarga. Anda memerlukan UID pengguna lain (bisa ditemukan di bagian bawah sidebar mereka) untuk menambahkan mereka sebagai kolaborator.</p>
              </section>
              <section className="pt-6 border-t border-slate-100">
                <h4 className="font-bold text-red-600 mb-4 uppercase tracking-widest text-xs">Zona Bahaya</h4>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={onExport}
                    className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm"
                  >
                    <Download className="w-4 h-4" /> Ekspor Semua Data (JSON)
                  </button>
                  <button
                    onClick={onImport}
                    className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm"
                  >
                    <FileUp className="w-4 h-4" /> Impor Data (JSON)
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onScan();
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-blue-100 text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all text-sm"
                  >
                    <Scan className="w-4 h-4" /> Scan Kartu Keluarga (AI)
                  </button>
                  <button
                    onClick={onDeleteAll}
                    className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-red-100 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition-all text-sm"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus Semua Data Saya
                  </button>
                </div>
              </section>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button
                onClick={onClose}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
              >
                Mengerti
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
