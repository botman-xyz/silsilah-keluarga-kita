/**
 * Move Member Modal
 * Feature to move a single member to another family
 */

import React, { useState, useMemo } from 'react';
import { Family, Member } from '../../types';
import { ArrowRight, X, AlertTriangle, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface MoveMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  families: Family[];
  members: Member[];
  onMove: (memberId: string, targetFamilyId: string) => Promise<void>;
}

export default function MoveMemberModal({
  isOpen,
  onClose,
  member,
  families,
  members,
  onMove
}: MoveMemberModalProps) {
  const [targetFamilyId, setTargetFamilyId] = useState<string>('');
  const [isMoving, setIsMoving] = useState(false);

  // Get current family of the member
  const currentFamily = useMemo(() => 
    families.find(f => f.id === member?.familyId),
    [families, member]
  );

  // Available families (exclude current family)
  const availableFamilies = useMemo(() => 
    families.filter(f => f.id !== member?.familyId),
    [families, member]
  );

  // Get members in target family
  const targetMembers = useMemo(() => 
    members.filter(m => m.familyId === targetFamilyId),
    [members, targetFamilyId]
  );

  // Check for duplicate name in target family
  const hasDuplicate = useMemo(() => 
    member && targetMembers.some(m => 
      m.name.toLowerCase() === member.name.toLowerCase()
    ),
    [member, targetMembers]
  );

  const handleMove = async () => {
    if (!member) {
      toast.error('Anggota tidak ditemukan');
      return;
    }

    if (!targetFamilyId) {
      toast.error('Pilih keluarga target');
      return;
    }

    if (member.familyId === targetFamilyId) {
      toast.error('Anggota sudah berada di keluarga target');
      return;
    }

    setIsMoving(true);
    try {
      await onMove(member.id, targetFamilyId);
      toast.success(`Berhasil memindahkan ${member.name} ke keluarga lain`);
      resetForm();
      onClose();
    } catch (error) {
      toast.error('Gagal memindahkan anggota');
    } finally {
      setIsMoving(false);
    }
  };

  const resetForm = () => {
    setTargetFamilyId('');
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Pindah Anggota</h2>
              <p className="text-sm text-slate-500">Pindahkan anggota ke keluarga lain</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Member Info */}
          <div className="mb-6 p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                member.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
              }`}>
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-slate-900">{member.name}</div>
                <div className="text-xs text-slate-500">
                  {member.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                  {member.birthDate && ` • ${new Date(member.birthDate).getFullYear()}`}
                </div>
              </div>
            </div>
          </div>

          {/* Current Family */}
          {currentFamily && (
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Keluarga Saat Ini
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                {currentFamily.name}
              </div>
            </div>
          )}

          {/* Target Family Selection */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Keluarga Target
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={targetFamilyId}
              onChange={(e) => setTargetFamilyId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Pilih Keluarga...</option>
              {availableFamilies.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            {targetFamilyId && (
              <p className="text-xs text-slate-500 mt-1">{targetMembers.length} anggota</p>
            )}
          </div>

          {/* Arrow indicator */}
          {targetFamilyId && (
            <div className="flex justify-center mb-4">
              <ArrowRight className="w-6 h-6 text-amber-400 rotate-90 sm:rotate-0" />
            </div>
          )}

          {/* Duplicate Warning */}
          {hasDuplicate && (
            <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-bold mb-1">Perhatian</p>
                  <p>Anggota dengan nama yang sama sudah ada di keluarga target. Ini dapat menyebabkan duplikasi.</p>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          {targetFamilyId && !hasDuplicate && (
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-sm text-blue-800">
                <p className="font-bold mb-1">Informasi</p>
                <p>Anggota akan dipindahkan ke keluarga target. Relasi keluarga (orang tua, pasangan) akan disesuaikan secara otomatis.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleMove}
            disabled={!targetFamilyId || isMoving}
            className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMoving ? 'Memproses...' : 'Pindahkan'}
          </button>
        </div>
      </div>
    </div>
  );
}
