import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, X, RefreshCw, Send, Search } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';

interface KinshipDictionaryModalProps {
  onClose: () => void;
}

export function KinshipDictionaryModal({ onClose }: KinshipDictionaryModalProps) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{ q: string, a: string }[]>([]);

  const handleAsk = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Anda adalah pakar silsilah dan istilah kekerabatan (kinship terms) di Indonesia. 
        Jelaskan istilah kekerabatan berikut dengan bahasa yang mudah dimengerti, sopan, dan berikan contoh jika perlu.
        Pertanyaan: ${query}`,
        config: {
          systemInstruction: "Gunakan bahasa Indonesia yang baik dan benar. Jika istilah tersebut memiliki variasi daerah (misal: Jawa, Sunda), sebutkan secara singkat sebagai tambahan informasi."
        }
      });

      const res = await model;
      const text = res.text || "Maaf, saya tidak dapat menemukan penjelasan untuk istilah tersebut.";
      setResponse(text);
      setHistory(prev => [{ q: query, a: text }, ...prev]);
      setQuery('');
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghubungi asisten AI.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[100vh]"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Kamus Kekerabatan AI</h3>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Pakar Silsilah Digital</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {response ? (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Penjelasan AI</div>
                <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {response}
                </div>
              </div>
              <button 
                onClick={() => setResponse('')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Tanya istilah lain
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-amber-50 text-amber-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Bingung dengan istilah keluarga?</h4>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">Tanyakan apa saja tentang sebutan keluarga, dari sepupu, ipar, hingga silsilah yang rumit.</p>
            </div>
          )}

          {history.length > 0 && !response && (
            <div className="space-y-3">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Riwayat Pencarian</h5>
              <div className="space-y-2">
                {history.slice(0, 3).map((h, i) => (
                  <button 
                    key={i}
                    onClick={() => setResponse(h.a)}
                    className="w-full text-left p-4 bg-white border border-slate-100 rounded-2xl hover:border-amber-200 transition-all group"
                  >
                    <div className="text-sm font-bold text-slate-700 group-hover:text-amber-600 transition-colors">{h.q}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
          <form onSubmit={handleAsk} className="relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Contoh: Apa itu sepupu dua kali?"
              className="w-full p-5 pr-16 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium text-slate-700"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!query.trim() || isLoading}
              className={`absolute right-2 top-2 bottom-2 px-4 rounded-xl flex items-center justify-center transition-all ${query.trim() && !isLoading ? 'bg-amber-500 text-white shadow-lg shadow-amber-100 hover:bg-amber-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-4 font-medium">
            Didukung oleh Gemini AI • Gunakan sebagai referensi edukasi
          </p>
        </div>
      </motion.div>
    </div>
  );
}
