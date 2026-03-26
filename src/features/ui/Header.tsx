import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Search, Plus, Share2, HelpCircle, User, LogOut, Trash2, ChevronLeft, ChevronRight, Eye, EyeOff, Sparkles, BookOpen, Printer } from 'lucide-react';
import { Family, UserProfile } from '../../types';

interface HeaderProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean) => void;
  isMobileSidebarOpen?: boolean;
  onMobileMenuToggle?: () => void;
  isHeaderHidden: boolean;
  setIsHeaderHidden: (v: boolean) => void;
  selectedFamily: Family | null;
  user: UserProfile | null;
  onSearchOpen: () => void;
  onAddMember: () => void;
  onShare: () => void;
  onHelp: () => void;
  onKinship: () => void;
  onPrint?: () => void;
}

export function Header({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileSidebarOpen,
  onMobileMenuToggle,
  isHeaderHidden,
  setIsHeaderHidden,
  selectedFamily,
  user,
  onSearchOpen,
  onAddMember,
  onShare,
  onHelp,
  onKinship,
  onPrint
}: HeaderProps) {
  if (isHeaderHidden) {
    return (
      <motion.button
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={() => setIsHeaderHidden(false)}
        className="fixed top-4 right-4 z-40 p-3 bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-xl text-slate-400 hover:text-blue-600 transition-all"
        title="Tampilkan Header"
      >
        <Eye className="w-5 h-5" />
      </motion.button>
    );
  }

  return (
    <header className="h-20 lg:h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Mobile menu button - visible only on mobile */}
        <button 
          onClick={onMobileMenuToggle}
          className="p-3 hover:bg-slate-100 rounded-2xl text-slate-500 transition-all active:scale-95 md:hidden"
          title="Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        {/* Desktop sidebar toggle - hidden on mobile */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-3 hover:bg-slate-100 rounded-2xl text-slate-500 transition-all active:scale-95 hidden md:block"
          title={isSidebarCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {selectedFamily?.name || 'Pilih Keluarga'}
            {selectedFamily && (
              <span className="hidden sm:inline-block px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-md">
                {selectedFamily.ownerId === user?.uid ? 'Pemilik' : 'Kolaborator'}
              </span>
            )}
          </h1>
          <p className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Silsilah Keluarga Digital</p>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <div className="hidden sm:flex items-center gap-2 mr-2 lg:mr-4">
          <button 
            onClick={onKinship}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-600 rounded-2xl font-bold text-xs hover:bg-amber-100 transition-all border border-amber-100"
          >
            <BookOpen className="w-4 h-4" /> Kamus AI
          </button>
        </div>

        <button 
          onClick={onSearchOpen}
          className="p-3 hover:bg-slate-100 rounded-2xl text-slate-500 transition-all active:scale-95"
          title="Cari Anggota"
        >
          <Search className="w-5 h-5 lg:w-6 h-6" />
        </button>
        
        {selectedFamily && (
          <>
            <button 
              onClick={onShare}
              className="p-3 hover:bg-blue-50 rounded-2xl text-blue-600 transition-all active:scale-95 hidden sm:block"
              title="Bagikan"
            >
              <Share2 className="w-5 h-5 lg:w-6 h-6" />
            </button>
            {onPrint && (
              <button 
                onClick={onPrint}
                className="p-3 hover:bg-slate-100 rounded-2xl text-slate-500 transition-all active:scale-95"
                title="Cetak / Simpan PDF"
              >
                <Printer className="w-5 h-5 lg:w-6 h-6" />
              </button>
            )}
            <button 
              onClick={onAddMember}
              className="flex items-center gap-2 px-4 lg:px-6 py-3 lg:py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs lg:text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 lg:w-5 h-5" /> <span className="hidden sm:inline">Tambah Anggota</span>
            </button>
          </>
        )}
        
        <button 
          onClick={onHelp}
          className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-95"
          title="Bantuan"
        >
          <HelpCircle className="w-5 h-5 lg:w-6 h-6" />
        </button>

        <button 
          onClick={() => setIsHeaderHidden(true)}
          className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-95 hidden lg:block"
          title="Sembunyikan Header"
        >
          <EyeOff className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
