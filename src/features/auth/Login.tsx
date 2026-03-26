import React from 'react';
import { motion } from 'motion/react';
import { Users, Sparkles, Layout, Share2, Heart } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white p-8 lg:p-12 rounded-[3rem] shadow-2xl shadow-slate-200 max-w-lg w-full text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />
        
        <div className="w-24 h-24 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200 rotate-3 hover:rotate-0 transition-transform duration-500">
          <Users className="w-12 h-12" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">SilsilahKU <span className="text-blue-600">Pro</span></h1>
        <p className="text-slate-500 mb-12 leading-relaxed font-medium">
          Simpan, kelola, dan visualisasikan silsilah keluarga Anda dengan teknologi AI modern.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
            <Layout className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visualisasi</div>
            <div className="text-xs font-bold text-slate-700">Pohon Interaktif</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
            <Share2 className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kolaborasi</div>
            <div className="text-xs font-bold text-slate-700">Akses Bersama</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
            <Sparkles className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kecerdasan</div>
            <div className="text-xs font-bold text-slate-700">AI Family Story</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
            <Heart className="w-6 h-6 text-pink-600 mx-auto mb-2" />
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kenangan</div>
            <div className="text-xs font-bold text-slate-700">Arsip Digital</div>
          </div>
        </div>

        <button 
          onClick={onLogin}
          className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 group"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 bg-white p-1 rounded-full" alt="Google" />
          Masuk dengan Google
        </button>
        
        <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Aman • Terenkripsi • Gratis Selamanya
        </p>
      </motion.div>
    </div>
  );
}
