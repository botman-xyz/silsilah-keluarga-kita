import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Scan, X, FileUp, Trash2, RefreshCw, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';
import { Member } from '../../types';

interface ScanKKModalProps {
  onClose: () => void;
  onDataExtracted: (data: Partial<Member>[]) => void;
}

export function ScanKKModal({ onClose, onDataExtracted }: ScanKKModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                { text: "Ekstrak informasi anggota keluarga dari gambar Kartu Keluarga ini. Kembalikan dalam format JSON array yang berisi objek dengan field: name, gender ('male' atau 'female'), birthDate (format YYYY-MM-DD), dan bio (opsional, berisi peran dalam keluarga). Pastikan output hanya berupa JSON valid tanpa markdown." },
                { inlineData: { data: base64Data, mimeType: file.type } }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json"
          }
        });

        const extractedData = JSON.parse(response.text || '[]');
        if (Array.isArray(extractedData)) {
          onDataExtracted(extractedData);
          toast.success(`Berhasil mengekstrak ${extractedData.length} anggota keluarga!`);
        } else {
          toast.error("Format data yang diekstrak tidak valid.");
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error scanning KK:", error);
      toast.error("Gagal memproses Kartu Keluarga.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[100vh]"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white">
          <div className="flex items-center gap-3">
            <Scan className="w-6 h-6" />
            <h3 className="text-xl font-bold">Scan Kartu Keluarga</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="text-center">
            <p className="text-slate-500 text-sm mb-6">
              Unggah foto Kartu Keluarga Anda untuk mengekstrak data anggota keluarga secara otomatis menggunakan AI.
            </p>
            
            {!previewUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileUp className="w-12 h-12 text-slate-300 group-hover:text-blue-500 mb-4 transition-colors" />
                  <p className="mb-2 text-sm text-slate-500 font-medium">Klik untuk unggah atau seret file</p>
                  <p className="text-xs text-slate-400">PNG, JPG atau JPEG (Maks. 5MB)</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="relative group">
                <img src={previewUrl} alt="Preview KK" className="w-full h-64 object-cover rounded-2xl border border-slate-200 shadow-inner" />
                <button 
                  onClick={() => { setFile(null); setPreviewUrl(null); }}
                  className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleScan}
            disabled={!file || isScanning}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl ${
              !file || isScanning 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Memproses dengan AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Mulai Scan AI
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
