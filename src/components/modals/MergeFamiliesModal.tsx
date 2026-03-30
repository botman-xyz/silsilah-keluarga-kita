/**
 * Merge Families Modal
 * Feature to merge two families into one
 */

import React, { useState, useMemo } from 'react';
import { Family, Member } from '../../types';
import { Users, ArrowRight, X, AlertTriangle, Check, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface MergeFamiliesModalProps {
  isOpen: boolean;
  onClose: () => void;
  families: Family[];
  members: Member[];
  onMerge: (sourceFamilyId: string, targetFamilyId: string, memberIds: string[]) => Promise<void>;
}

export default function MergeFamiliesModal({
  isOpen,
  onClose,
  families,
  members,
  onMerge
}: MergeFamiliesModalProps) {
  const [sourceFamilyId, setSourceFamilyId] = useState<string>('');
  const [targetFamilyId, setTargetFamilyId] = useState<string>('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [isMerging, setIsMerging] = useState(false);

  // Get members for each family
  const sourceMembers = useMemo(() => 
    members.filter(m => m.familyId === sourceFamilyId),
    [members, sourceFamilyId]
  );

  const targetMembers = useMemo(() => 
    members.filter(m => m.familyId === targetFamilyId),
    [members, targetFamilyId]
  );

  // Available families (exclude selected ones)
  const availableFamilies = useMemo(() => 
    families.filter(f => f.id !== sourceFamilyId),
    [families, sourceFamilyId]
  );

  const toggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const selectAll = () => {
    setSelectedMembers(new Set(sourceMembers.map(m => m.id)));
  };

  const selectNone = () => {
    setSelectedMembers(new Set());
  };

  const handleMerge = async () => {
    if (!sourceFamilyId || !targetFamilyId) {
      toast.error('Pilih keluarga sumber dan target');
      return;
    }

    if (selectedMembers.size === 0) {
      toast.error('Pilih minimal satu anggota untuk dipindahkan');
      return;
    }

    if (sourceFamilyId === targetFamilyId) {
      toast.error('Keluarga sumber dan target tidak boleh sama');
      return;
    }

    setIsMerging(true);
    try {
      await onMerge(sourceFamilyId, targetFamilyId, Array.from(selectedMembers));
      toast.success('Berhasil menggabungkan keluarga');
      resetForm();
      onClose();
    } catch (error) {
      toast.error('Gagal menggabungkan keluarga');
    } finally {
      setIsMerging(false);
    }
  };

  const resetForm = () => {
    setSourceFamilyId('');
    setTargetFamilyId('');
    setSelectedMembers(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Gabungkan Keluarga</h2>
              <p className="text-sm text-slate-500">Pindahkan anggota dari satu keluarga ke keluarga lain</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Family Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Keluarga Sumber
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={sourceFamilyId}
                onChange={(e) => { setSourceFamilyId(e.target.value); setSelectedMembers(new Set()); }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Pilih Keluarga...</option>
                {families.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              {sourceFamilyId && (
                <p className="text-xs text-slate-500 mt-1">{sourceMembers.length} anggota</p>
              )}
            </div>

            <div>
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
          </div>

          {/* Arrow indicator */}
          {sourceFamilyId && targetFamilyId && (
            <div className="flex justify-center mb-6">
              <ArrowRight className="w-8 h-8 text-amber-400 rotate-90 sm:rotate-0" />
            </div>
          )}

          {/* Member Selection */}
          {sourceFamilyId && targetFamilyId && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-slate-700">
                  Pilih Anggota yang Dipindahkan
                  <span className="text-amber-600 ml-1">({selectedMembers.size}/{sourceMembers.length})</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Pilih Semua
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={selectNone}
                    className="text-xs text-slate-500 hover:text-slate-600 font-medium"
                  >
                    Batal Semua
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sourceMembers.map(member => {
                  const isSelected = selectedMembers.has(member.id);
                  const hasDuplicate = targetMembers.some(m => 
                    m.name.toLowerCase() === member.name.toLowerCase()
                  );

                  return (
                    <button
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-50' 
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        member.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                      }`}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 text-left">
                        <div className="font-medium text-slate-900 flex items-center gap-2">
                          {member.name}
                          {hasDuplicate && (
                            <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                              Duplikat
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {member.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                          {member.birthDate && ` • ${new Date(member.birthDate).getFullYear()}`}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {sourceMembers.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Tidak ada anggota di keluarga sumber</p>
                </div>
              )}
            </div>
          )}

          {/* Warning */}
          {sourceFamilyId && targetFamilyId && (
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-bold mb-1">Perhatian</p>
                  <p>Anggota yang dipindahkan akan memiliki familyId keluarga target. Anda dapat memilih untuk menghapus keluarga sumber setelah merge.</p>
                </div>
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
            onClick={handleMerge}
            disabled={!sourceFamilyId || !targetFamilyId || selectedMembers.size === 0 || isMerging}
            className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMerging ? 'Memproses...' : `Pindahkan ${selectedMembers.size} Anggota`}
          </button>
        </div>
      </div>
    </div>
  );
}
