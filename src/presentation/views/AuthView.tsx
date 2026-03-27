import React from 'react';
import { motion } from 'motion/react';
import { LogOut, Users } from 'lucide-react';
import { Login } from '../../features/auth/Login';
import { FamilyForm } from '../../features/family/FamilyForm';
import { UserProfile } from '../../types';

interface AuthViewProps {
  isAuthReady: boolean;
  user: UserProfile | null;
  familiesCount: number;
  onLogin: () => void;
  onLogout: () => void;
  onAddFirstFamily: (name: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  isAuthReady,
  user,
  familiesCount,
  onLogin,
  onLogout,
  onAddFirstFamily,
}) => {
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 bg-blue-600 text-white rounded-4xl flex items-center justify-center shadow-2xl shadow-blue-200 animate-pulse">
            <Users className="w-10 h-10" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Silsilah Keluarga</h1>
            <p className="text-slate-400 font-medium animate-pulse">Menghubungkan masa lalu dan masa depan...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={onLogin} />;
  }

  if (familiesCount === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl text-center border border-slate-100"
        >
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-4xl flex items-center justify-center mx-auto mb-8">
            <Users className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Mulai Silsilah Baru</h2>
          <p className="text-slate-500 mb-10 font-medium leading-relaxed">
            Anda belum memiliki silsilah keluarga. Buat silsilah pertama Anda untuk mulai mencatat sejarah keluarga.
          </p>
          
          <FamilyForm 
            initialData={{}} 
            onSave={(data) => onAddFirstFamily(data.name || '')}
            onCancel={onLogout}
          />
          
          <button 
            onClick={onLogout}
            className="mt-8 text-slate-400 hover:text-red-500 font-bold text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </motion.div>
      </div>
    );
  }

  return null;
};
