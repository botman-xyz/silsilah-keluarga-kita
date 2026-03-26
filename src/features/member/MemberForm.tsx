import React, { useState } from 'react';
import { Member, Family } from '../../types';
import { Plus, ImageIcon, FileText, Trash2, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MemberFormProps {
  initialData: Partial<Member>;
  members: Member[];
  allMembers: Member[];
  families: Family[];
  onSave: (data: Partial<Member>) => void;
  onCancel: () => void;
}

interface FormErrors {
  name?: string;
  birthDate?: string;
  deathDate?: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
}

export function MemberForm({ initialData, members, allMembers, families, onSave, onCancel }: MemberFormProps) {
  // DEBUG: Log initial data more thoroughly
  console.log('[DEBUG] MemberForm received initialData:', JSON.stringify(initialData));
  console.log('[DEBUG] Has id?:', !!initialData.id, 'id value:', initialData.id);
  
  const [errors, setErrors] = useState<FormErrors>({});
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Name validation
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Nama lengkap harus diisi';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nama harus minimal 2 karakter';
    }
    
    // Birth date validation
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (birthDate > today) {
        newErrors.birthDate = 'Tanggal lahir tidak boleh di masa depan';
      }
    }
    
    // Death date validation
    if (formData.deathDate && formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const deathDate = new Date(formData.deathDate);
      if (deathDate < birthDate) {
        newErrors.deathDate = 'Tanggal wafat harus setelah tanggal lahir';
      }
    }
    
    // Father gender validation
    if (formData.fatherId) {
      const father = allMembers.find(m => m.id === formData.fatherId);
      if (father && father.gender !== 'male') {
        newErrors.fatherId = 'Ayah harus berjenis kelamin laki-laki';
      }
      if (father && formData.id && father.id === formData.id) {
        newErrors.fatherId = 'Seseorang tidak bisa menjadi ayah bagi dirinya sendiri';
      }
    }
    
    // Mother gender validation
    if (formData.motherId) {
      const mother = allMembers.find(m => m.id === formData.motherId);
      if (mother && mother.gender !== 'female') {
        newErrors.motherId = 'Ibu harus berjenis kelamin perempuan';
      }
      if (mother && formData.id && mother.id === formData.id) {
        newErrors.motherId = 'Seseorang tidak bisa menjadi ibu bagi dirinya sendiri';
      }
    }
    
    // Spouse cannot be self
    if (formData.spouseId && formData.id && formData.spouseId === formData.id) {
      newErrors.spouseId = 'Seseorang tidak bisa menjadi pasangan bagi dirinya sendiri';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const [formData, setFormData] = useState<Partial<Member>>(() => {
    const base = {
      name: '',
      gender: 'male',
      fatherId: '',
      motherId: '',
      isAdoptedChild: false,
      spouseId: '',
      spouseIds: [],
      externalSpouseName: '',
      externalFamilyId: '',
      birthDate: '',
      photoUrl: '',
      bio: '',
      media: [],
      maritalStatus: 'single',
      ...initialData
    };
    
    // If has spouse but status is single (default), set to married
    if (base.spouseId && base.maritalStatus === 'single') {
      base.maritalStatus = 'married';
    }
    
    // If NO spouse but status is married, set back to single
    if (!base.spouseId && base.maritalStatus === 'married') {
      base.maritalStatus = 'single';
    }
    
    return base as Partial<Member>;
  });

  // Auto-fill logic: if father is selected and has a spouse, suggest mother
  const handleFatherChange = (id: string) => {
    const father = allMembers.find(m => m.id === id);
    let updates: Partial<Member> = { fatherId: id };
    if (father?.spouseId && !formData.motherId) {
      const spouse = allMembers.find(m => m.id === father.spouseId);
      if (spouse && spouse.gender === 'female') {
        updates.motherId = spouse.id;
      }
    }
    setFormData({ ...formData, ...updates });
  };

  const handleMotherChange = (id: string) => {
    const mother = allMembers.find(m => m.id === id);
    let updates: Partial<Member> = { motherId: id };
    if (mother?.spouseId && !formData.fatherId) {
      const spouse = allMembers.find(m => m.id === mother.spouseId);
      if (spouse && spouse.gender === 'male') {
        updates.fatherId = spouse.id;
      }
    }
    setFormData({ ...formData, ...updates });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Informasi Dasar</h4>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className={`w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 transition-all ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'}`}
              placeholder="Nama lengkap"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Jenis Kelamin</label>
            <div className="flex gap-3">
              {['male', 'female'].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: g as any })}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${formData.gender === g ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  {g === 'male' ? 'Laki-laki' : 'Perempuan'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Status Perkawinan</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'single', label: 'Lajang' },
                { id: 'married', label: 'Menikah' },
                { id: 'divorced', label: 'Cerai' },
                { id: 'widowed', label: 'Janda/Duda' }
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, maritalStatus: s.id as any })}
                  className={`py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${formData.maritalStatus === s.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Lahir</label>
            <input 
              type="date" 
              value={formData.birthDate}
              onChange={(e) => {
                setFormData({ ...formData, birthDate: e.target.value });
                if (errors.birthDate) setErrors({ ...errors, birthDate: undefined });
              }}
              className={`w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 transition-all ${errors.birthDate ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'}`}
            />
            {errors.birthDate && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.birthDate}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Wafat (Opsional)</label>
            <input 
              type="date" 
              value={formData.deathDate || ''}
              onChange={(e) => {
                setFormData({ ...formData, deathDate: e.target.value });
                if (errors.deathDate) setErrors({ ...errors, deathDate: undefined });
              }}
              className={`w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 transition-all ${errors.deathDate ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'}`}
            />
            {errors.deathDate && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.deathDate}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">URL Foto (Opsional)</label>
            <input 
              type="text" 
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="https://example.com/foto.jpg"
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Arsip & Galeri</h4>
              <button 
                type="button"
                onClick={() => {
                  const url = prompt("Masukkan URL Media (Gambar/Dokumen):");
                  const name = prompt("Masukkan Nama Media (misal: Akta Kelahiran):");
                  if (url && name) {
                    const type = (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? 'image' : 'document';
                    setFormData({
                      ...formData,
                      media: [...(formData.media || []), { url, name, type: type as any }]
                    });
                  }
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Tambah Media
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.media?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'image' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                    {item.type === 'image' ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-700 truncate">{item.name}</div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      const newMedia = [...(formData.media || [])];
                      newMedia.splice(idx, 1);
                      setFormData({ ...formData, media: newMedia });
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!formData.media || formData.media.length === 0) && (
                <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl">
                  <p className="text-xs text-slate-400">Belum ada arsip digital.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Hubungan Keluarga</h4>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Ayah</label>
            <select 
              value={formData.fatherId}
              onChange={(e) => handleFatherChange(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
            >
              <option value="">Pilih Ayah</option>
              <optgroup label="Dalam Keluarga Ini">
                {members.filter(m => m.gender === 'male' && m.id !== initialData.id).map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </optgroup>
              <optgroup label="Dari Keluarga Lain">
                {allMembers.filter(m => m.gender === 'male' && m.familyId !== formData.familyId).map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({families.find(f => f.id === m.familyId)?.name})</option>
                ))}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Ibu</label>
            <select 
              value={formData.motherId}
              onChange={(e) => handleMotherChange(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
            >
              <option value="">Pilih Ibu</option>
              <optgroup label="Dalam Keluarga Ini">
                {members.filter(m => m.gender === 'female' && m.id !== initialData.id).map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </optgroup>
              <optgroup label="Dari Keluarga Lain">
                {allMembers.filter(m => m.gender === 'female' && m.familyId !== formData.familyId).map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({families.find(f => f.id === m.familyId)?.name})</option>
                ))}
              </optgroup>
            </select>
          </div>
          
          {/* Anak Angkat Checkbox */}
          {(formData.fatherId || formData.motherId) && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <input
                type="checkbox"
                id="isAdoptedChild"
                checked={formData.isAdoptedChild || false}
                onChange={(e) => setFormData({ ...formData, isAdoptedChild: e.target.checked })}
                className="w-5 h-5 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
              />
              <label htmlFor="isAdoptedChild" className="text-sm font-medium text-amber-800">
                Anak Angkat (bukan anak kandung)
              </label>
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Pasangan (Suami/Istri)</label>
            <select 
              value={formData.spouseId}
              onChange={(e) => {
                const newSpouseId = e.target.value;
                const currentSpouseIds = formData.spouseIds || [];
                let newSpouseIds = [...currentSpouseIds];
                if (newSpouseId && !newSpouseIds.includes(newSpouseId)) {
                  newSpouseIds.push(newSpouseId);
                }
                
                // Set status to married if spouse is selected and current status is single
                // Set status to single if spouse is removed and current status is married
                let newStatus = formData.maritalStatus;
                if (newSpouseId && formData.maritalStatus === 'single') {
                  newStatus = 'married';
                } else if (!newSpouseId && formData.maritalStatus === 'married') {
                  newStatus = 'single';
                }
                
                setFormData({ 
                  ...formData, 
                  spouseId: newSpouseId, 
                  spouseIds: newSpouseIds,
                  maritalStatus: newStatus as any
                });
              }}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
            >
              <option value="">Pilih Pasangan Utama</option>
              <optgroup label="Dalam Keluarga Ini">
                {members.filter(m => m.id !== initialData.id).map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </optgroup>
              <optgroup label="Dari Keluarga Lain">
                {allMembers.filter(m => m.id !== initialData.id && m.familyId !== formData.familyId).map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({families.find(f => f.id === m.familyId)?.name})</option>
                ))}
              </optgroup>
            </select>
          </div>

          {formData.spouseIds && formData.spouseIds.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Riwayat Pasangan</label>
              <div className="flex flex-wrap gap-2">
                {formData.spouseIds.map(sid => {
                  const s = allMembers.find(m => m.id === sid);
                  if (!s) return null;
                  return (
                    <div key={sid} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                      <span className="text-xs font-medium text-slate-700">{s.name}</span>
                      <button 
                        onClick={() => {
                          const newSpouseIds = formData.spouseIds?.filter(id => id !== sid);
                          const newSpouseId = formData.spouseId === sid ? '' : formData.spouseId;
                          setFormData({ ...formData, spouseIds: newSpouseIds, spouseId: newSpouseId });
                        }}
                        className="p-0.5 hover:bg-slate-200 rounded-full"
                      >
                        <X className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="pt-4 border-t border-slate-100">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Pasangan dari Keluarga Lain</h5>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Pasangan Eksternal</label>
                <input 
                  type="text" 
                  value={formData.externalSpouseName}
                  onChange={(e) => setFormData({ ...formData, externalSpouseName: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Contoh: Siti (Keluarga Pratama)"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Tautkan ke Keluarga (Opsional)</label>
                <select 
                  value={formData.externalFamilyId}
                  onChange={(e) => setFormData({ ...formData, externalFamilyId: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                >
                  <option value="">Tidak Ada Tautan</option>
                  {families.filter(f => f.id !== formData.familyId).map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Biografi Singkat</label>
        <textarea 
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none transition-all"
          placeholder="Cerita singkat tentang anggota keluarga ini..."
        />
      </div>

      <div className="flex gap-4 pt-6 border-t border-slate-100">
        <button 
          onClick={onCancel}
          className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
        >
          Batal
        </button>
        <button 
          onClick={() => {
            // Validate before saving
            if (!validateForm()) {
              toast.error('Mohon perbaiki kesalahan pada form');
              return;
            }
            onSave(formData);
          }}
          className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
        >
          Simpan Anggota
        </button>
      </div>
    </div>
  );
}
