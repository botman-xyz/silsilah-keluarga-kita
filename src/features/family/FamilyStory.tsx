import React, { useState } from 'react';
import { Member, Family } from '../../types';
import { Sparkles, BookOpen, RefreshCw, Copy, Check, Download } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface FamilyStoryProps {
  family: Family;
  members: Member[];
}

export default function FamilyStory({ family, members }: FamilyStoryProps) {
  const [story, setStory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateStory = async () => {
    if (members.length === 0) return;
    
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      // Prepare data for Gemini
      const memberData = members.map(m => ({
        name: m.name,
        gender: m.gender,
        birth: m.birthDate ? new Date(m.birthDate).getFullYear() : 'Unknown',
        death: m.deathDate ? new Date(m.deathDate).getFullYear() : 'Present',
        bio: m.bio || '',
        parents: [
          members.find(p => p.id === m.fatherId)?.name,
          members.find(p => p.id === m.motherId)?.name
        ].filter(Boolean),
        spouse: members.find(s => s.id === m.spouseId)?.name
      }));

      const prompt = `
        Tuliskan sebuah narasi sejarah atau cerita keluarga yang menarik berdasarkan data silsilah keluarga "${family.name}" berikut.
        Gunakan gaya bahasa yang hangat, menghormati, dan sedikit puitis dalam Bahasa Indonesia.
        Fokus pada bagaimana generasi terhubung dan warisan yang ditinggalkan.
        
        Data Anggota:
        ${JSON.stringify(memberData, null, 2)}
        
        Format output dalam Markdown dengan judul yang menarik.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setStory(response.text || 'Gagal menghasilkan cerita.');
    } catch (error) {
      console.error('Error generating story:', error);
      setStory('Terjadi kesalahan saat menghubungi AI. Pastikan API Key sudah terkonfigurasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(story);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([story], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${family.name}-cerita.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Narasi Keluarga AI</h2>
                <p className="text-sm text-slate-500">Gunakan AI untuk merangkai sejarah keluarga Anda menjadi cerita yang indah.</p>
              </div>
            </div>
            <button
              onClick={generateStory}
              disabled={isLoading || members.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <BookOpen className="w-4 h-4" />
              )}
              {story ? 'Regenerasi Cerita' : 'Buat Cerita Keluarga'}
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 min-h-[400px] relative">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10"
              >
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">Merangkai kenangan menjadi kata-kata...</p>
              </motion.div>
            ) : story ? (
              <motion.div
                key="story"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-slate max-w-none"
              >
                <div className="flex justify-end gap-2 mb-6 sticky top-0 bg-white/80 backdrop-blur-sm py-2 z-10">
                  <button
                    onClick={handleCopy}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Salin Cerita"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Unduh Markdown"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
                <div className="markdown-body">
                  <ReactMarkdown>{story}</ReactMarkdown>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">Klik tombol di atas untuk mulai menulis sejarah keluarga Anda.</p>
                <p className="text-sm max-w-xs text-center mt-2">AI akan menganalisis hubungan, tanggal, dan biografi anggota keluarga untuk membuat narasi yang unik.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4">
        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-900 mb-1">Tips untuk hasil terbaik:</h4>
          <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside opacity-80">
            <li>Lengkapi data tanggal lahir dan wafat anggota keluarga.</li>
            <li>Tambahkan biografi singkat pada profil anggota (misal: pekerjaan, hobi, atau pencapaian).</li>
            <li>Pastikan hubungan orang tua dan pasangan sudah terhubung dengan benar.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
