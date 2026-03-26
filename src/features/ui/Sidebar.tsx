import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Users, Layout, BarChart2, Calendar, Calculator, BookOpen, List, LogOut, Trash2, User, ChevronLeft, ChevronRight, Share2, Search, Edit2, X, Download, FileUp, Scan, Sparkles, RefreshCw, Send, ImageIcon, FileText, ExternalLink, Heart } from 'lucide-react';
import { Family, Member, UserProfile } from '../../types';
import { toast } from 'sonner';

interface SidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean) => void;
  families: Family[];
  selectedFamily: Family | null;
  setSelectedFamily: (f: Family | null) => void;
  members: Member[];
  extendedMembers: Member[];
  user: UserProfile | null;
  onLogout: () => void;
  onAddFamily: () => void;
  onEditFamily: (f: Family) => void;
  onDeleteFamily: () => void;
  onShare: () => void;
  viewMode: string;
  setViewMode: (v: any) => void;
  onMemberClick: (m: Member) => void;
  onCheckDuplicates: () => void;
  onImportJSON: () => void;
}

export function Sidebar({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  families,
  selectedFamily,
  setSelectedFamily,
  members,
  extendedMembers,
  user,
  onLogout,
  onAddFamily,
  onEditFamily,
  onDeleteFamily,
  onShare,
  viewMode,
  setViewMode,
  onMemberClick,
  onCheckDuplicates,
  onImportJSON
}: SidebarProps) {
  const sidebarVariants = {
    expanded: { width: "320px", transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
    collapsed: { width: "80px", transition: { type: "spring" as const, stiffness: 300, damping: 30 } }
  };

  const menuItems = [
    { id: 'tree', label: 'Pohon Silsilah', icon: Layout },
    { id: 'list', label: 'Daftar Anggota', icon: List },
    { id: 'stats', label: 'Statistik Keluarga', icon: BarChart2 },
    { id: 'timeline', label: 'Garis Waktu', icon: Calendar },
    { id: 'calculator', label: 'Kalkulator Hubungan', icon: Calculator },
    { id: 'story', label: 'Kisah Keluarga (AI)', icon: BookOpen },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={isSidebarCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      className="bg-slate-900 text-white h-screen flex flex-col sticky top-0 z-50 overflow-hidden shadow-2xl"
    >
      <div className="p-6 flex items-center justify-between border-b border-slate-800/50">
        {!isSidebarCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter">SilsilahKU</h2>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">v2.5 Pro</p>
            </div>
          </motion.div>
        )}
        {isSidebarCollapsed && (
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-6 space-y-8">
        <section>
          {!isSidebarCollapsed && (
            <div className="flex items-center justify-between px-3 mb-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grup Keluarga</h3>
              <button 
                onClick={onAddFamily}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-blue-400 transition-colors"
                title="Tambah Keluarga"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="space-y-1.5">
            {families.map(family => (
              <button
                key={family.id}
                onClick={() => setSelectedFamily(family)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group ${selectedFamily?.id === family.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${selectedFamily?.id === family.id ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                  {family.name.charAt(0).toUpperCase()}
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex-1 text-left truncate">
                    <div className="font-bold text-sm">{family.name}</div>
                    <div className="text-[10px] opacity-60 font-medium">
                      {family.ownerId === user?.uid ? 'Milik Saya' : 'Kolaborasi'}
                    </div>
                  </div>
                )}
              </button>
            ))}
            {isSidebarCollapsed && (
              <button 
                onClick={onAddFamily}
                className="w-10 h-10 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all mx-auto mt-4"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        </section>

        {selectedFamily && (
          <section>
            {!isSidebarCollapsed && (
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-4">Navigasi View</h3>
            )}
            <div className="space-y-1">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setViewMode(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all ${viewMode === item.id ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}
                >
                  <item.icon className={`w-5 h-5 shrink-0 ${viewMode === item.id ? 'text-blue-400' : 'text-slate-500'}`} />
                  {!isSidebarCollapsed && <span className="text-sm font-bold">{item.label}</span>}
                </button>
              ))}
            </div>
          </section>
        )}

        {!isSidebarCollapsed && selectedFamily && (
          <section className="pt-4 border-t border-slate-800/50">
            <div className="px-3 mb-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Anggota ({members.length})</h3>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {members.slice(0, 10).map(member => (
                <button
                  key={member.id}
                  onClick={() => onMemberClick(member)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-slate-800/50 rounded-xl transition-all text-left group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 ${member.gender === 'male' ? 'bg-blue-500/80' : 'bg-pink-500/80'}`}>
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.name} className="w-full h-full rounded-lg object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      member.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <div className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate">{member.name}</div>
                    <div className="text-[9px] text-slate-500 font-medium">
                      {member.birthDate ? `${new Date(member.birthDate).getFullYear()} • ${Math.floor((new Date().getTime() - new Date(member.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} th` : '?'}
                    </div>
                  </div>
                </button>
              ))}
              {members.length > 10 && (
                <button 
                  onClick={() => setViewMode('list')}
                  className="w-full py-2 text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
                >
                  Lihat Semua Anggota
                </button>
              )}
            </div>
          </section>
        )}

        {!isSidebarCollapsed && selectedFamily && (
          <section className="pt-4 border-t border-slate-800/50">
            <div className="px-3 mb-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Keluarga Inti</h3>
            </div>
            <div className="px-3 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Total Anggota</span>
                <span className="text-slate-200 font-black">{extendedMembers.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Laki-laki</span>
                <span className="text-blue-400 font-black">{extendedMembers.filter(m => m.gender === 'male').length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Perempuan</span>
                <span className="text-pink-400 font-black">{extendedMembers.filter(m => m.gender === 'female').length}</span>
              </div>
              <button 
                onClick={onCheckDuplicates}
                className="w-full mt-2 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
              >
                Cek Duplikasi
              </button>
            </div>
          </section>
        )}

        {!isSidebarCollapsed && selectedFamily && selectedFamily.ownerId === user?.uid && (
          <section className="pt-4 border-t border-slate-800/50">
            <div className="px-3 mb-4 flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kolaborator</h3>
              <button 
                onClick={onShare}
                className="p-1 hover:bg-slate-800 rounded text-blue-400"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="px-3 space-y-2">
              {selectedFamily.collaborators?.map(email => (
                <div key={email} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                      {email.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[10px] text-slate-400 truncate font-medium">{email}</span>
                  </div>
                </div>
              ))}
              {(!selectedFamily.collaborators || selectedFamily.collaborators.length === 0) && (
                <p className="text-[10px] text-slate-600 italic px-1">Belum ada kolaborator</p>
              )}
            </div>
          </section>
        )}
      </div>

      <div className="p-4 bg-slate-950/50 border-t border-slate-800/50">
        {!isSidebarCollapsed ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-2xl border border-slate-800/50">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-900/20">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full rounded-xl object-cover" referrerPolicy="no-referrer" />
                ) : (
                  user?.displayName?.charAt(0).toUpperCase() || <User className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black text-white truncate">{user?.displayName || 'User'}</div>
                <div className="text-[9px] font-bold text-blue-400 uppercase tracking-widest truncate">{user?.role || 'Member'}</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {selectedFamily && selectedFamily.ownerId === user?.uid && (
                <>
                  <button 
                    onClick={() => onEditFamily(selectedFamily)}
                    className="flex-1 p-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 hover:text-white transition-all"
                    title="Edit Keluarga"
                  >
                    <Edit2 className="w-4 h-4 mx-auto" />
                  </button>
                  <button 
                    onClick={onDeleteFamily}
                    className="flex-1 p-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-red-900/30 hover:text-red-400 transition-all"
                    title="Hapus Keluarga"
                  >
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </>
              )}
              <button 
                onClick={onLogout}
                className="flex-1 p-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 hover:text-white transition-all"
                title="Keluar"
              >
                <LogOut className="w-4 h-4 mx-auto" />
              </button>
            </div>
            
            <div className="pt-2">
              <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1 px-1">ID Pengguna Anda</div>
              <div className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-800/50 flex items-center justify-between group">
                <code className="text-[9px] text-slate-500 font-mono truncate">{user?.uid}</code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(user?.uid || '');
                    toast.success('UID berhasil disalin!');
                  }}
                  className="p-1 hover:bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Layout className="w-3 h-3 text-blue-500" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-900/20 overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user?.displayName?.charAt(0).toUpperCase() || <User className="w-5 h-5" />
              )}
            </div>
            <button 
              onClick={onLogout}
              className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 hover:text-white transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
