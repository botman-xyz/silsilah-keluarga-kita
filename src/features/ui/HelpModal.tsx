import { motion } from 'motion/react';
import { X, Scan, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanKK: () => void;
  onDeleteAll: () => void;
}

export function HelpModal({ isOpen, onClose, onScanKK, onDeleteAll }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Panduan Penggunaan</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Scan className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-bold text-slate-900">Scan Kartu Keluarga</h4>
              </div>
              <p className="text-sm text-slate-600 mb-4">
               导入数据的方式：您可以通过扫描印尼身份证（KTP）或家庭卡（KK）来自动导入家庭成员信息。
              </p>
              <button 
                onClick={() => {
                  onClose();
                  onScanKK();
                }}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                Scan KK Sekarang
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">Fitur Utama</h4>
              
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
                <BookOpen className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Kamus Kerabat</p>
                  <p className="text-sm text-slate-500">使用 AI 了解亲属关系术语</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
                <Trash2 className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Hapus Semua Data</p>
                  <p className="text-sm text-slate-500">从 Firebase 删除所有家庭数据</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
                  onDeleteAll();
                  toast.success('Semua data Anda telah dihapus.');
                  onClose();
                }
              }}
              className="w-full py-4 border-2 border-red-200 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Hapus Semua Data
            </button>

            <button
              onClick={onClose}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
