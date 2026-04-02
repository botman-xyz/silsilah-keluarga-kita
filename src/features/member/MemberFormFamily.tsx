import React from 'react';
import { Member, Family } from '../../types';
import { 
  Heart, 
  Trash2, 
  AlertCircle
} from 'lucide-react';
import { FormErrors } from './memberValidation';

interface FamilySectionProps {
  formData: Partial<Member>;
  errors: FormErrors;
  touched: Record<string, boolean>;
  members: Member[];
  allMembers: Member[];
  families: Family[];
  initialData: Partial<Member>;
  onFieldChange: (field: keyof Member, value: any) => void;
  onFatherChange: (id: string) => void;
  onMotherChange: (id: string) => void;
  onSpouseChange: (id: string) => void;
}

const renderFieldError = (
  errors: FormErrors,
  touched: Record<string, boolean>,
  field: keyof FormErrors
) => {
  if (!errors[field] || !touched[field]) return null;
  return (
    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {errors[field]}
    </p>
  );
};

export const FamilySection: React.FC<FamilySectionProps> = ({
  formData,
  errors,
  touched,
  members,
  allMembers,
  families,
  initialData,
  onFieldChange,
  onFatherChange,
  onMotherChange,
  onSpouseChange,
}) => {
  const currentFamilyId = formData.familyId || (members.length > 0 ? members[0].familyId : '');
  const localMales = members.filter(m => m.gender === 'male' && m.id !== initialData.id);
  const externalMales = allMembers.filter(m => 
    m.gender === 'male' && 
    m.id !== initialData.id &&
    m.familyId !== currentFamilyId
  );
  const localFemales = members.filter(m => m.gender === 'female' && m.id !== initialData.id);
  const externalFemales = allMembers.filter(m => 
    m.gender === 'female' && 
    m.id !== initialData.id &&
    m.familyId !== currentFamilyId
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
        <h4 className="text-sm font-bold text-purple-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Hubungan Keluarga
        </h4>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Ayah
            </label>
            <select 
              value={formData.fatherId || ''}
              onChange={(e) => onFatherChange(e.target.value)}
              className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl outline-none transition-all duration-200 appearance-none ${
                errors.fatherId && touched.fatherId
                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
              }`}
            >
              <option value="">Pilih Ayah</option>
              {localMales.length > 0 && (
                <optgroup label="Dalam Keluarga Ini">
                  {localMales.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </optgroup>
              )}
              {externalMales.length > 0 && (
                <optgroup label="Dari Keluarga Lain">
                  {externalMales.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({families.find(f => f.id === m.familyId)?.name})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            {renderFieldError(errors, touched, 'fatherId')}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Ibu
            </label>
            <select 
              value={formData.motherId || ''}
              onChange={(e) => onMotherChange(e.target.value)}
              className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl outline-none transition-all duration-200 appearance-none ${
                errors.motherId && touched.motherId
                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
              }`}
            >
              <option value="">Pilih Ibu</option>
              {localFemales.length > 0 && (
                <optgroup label="Dalam Keluarga Ini">
                  {localFemales.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </optgroup>
              )}
              {externalFemales.length > 0 && (
                <optgroup label="Dari Keluarga Lain">
                  {externalFemales.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({families.find(f => f.id === m.familyId)?.name})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            {renderFieldError(errors, touched, 'motherId')}
          </div>

          {(formData.fatherId || formData.motherId) && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
              <input
                type="checkbox"
                id="isAdoptedChild"
                checked={formData.isAdoptedChild || false}
                onChange={(e) => onFieldChange('isAdoptedChild', e.target.checked)}
                className="w-5 h-5 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
              />
              <label htmlFor="isAdoptedChild" className="text-sm font-medium text-amber-800">
                Anak Angkat (bukan anak kandung)
              </label>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Pasangan (Suami/Istri)
            </label>
            <select 
              value={formData.spouseId || ''}
              onChange={(e) => onSpouseChange(e.target.value)}
              className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl outline-none transition-all duration-200 appearance-none ${
                errors.spouseId && touched.spouseId
                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
              }`}
            >
              <option value="">Pilih Pasangan Utama</option>
              <optgroup label="Dalam Keluarga Ini">
                {members.filter(m => m.id !== initialData.id).map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </optgroup>
              <optgroup label="Dari Keluarga Lain">
                {allMembers.filter(m => m.id !== initialData.id && m.familyId !== formData.familyId).map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({families.find(f => f.id === m.familyId)?.name})
                  </option>
                ))}
              </optgroup>
            </select>
            {renderFieldError(errors, touched, 'spouseId')}
          </div>

          {formData.spouseIds && formData.spouseIds.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Riwayat Pasangan
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.spouseIds.map(sid => {
                  const spouse = allMembers.find(m => m.id === sid);
                  if (!spouse) return null;
                  return (
                    <div 
                      key={sid} 
                      className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border-2 border-slate-200"
                    >
                      <span className="text-sm font-medium text-slate-700">{spouse.name}</span>
                      <button 
                        type="button"
                        onClick={() => {
                          const newSpouseIds = formData.spouseIds?.filter(id => id !== sid);
                          const newSpouseId = formData.spouseId === sid ? '' : formData.spouseId;
                          onFieldChange('spouseIds', newSpouseIds);
                          onFieldChange('spouseId', newSpouseId);
                        }}
                        className="p-1 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-purple-100">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Pasangan dari Keluarga Lain
            </h5>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Nama Pasangan Eksternal
                </label>
                <input 
                  type="text" 
                  value={formData.externalSpouseName || ''}
                  onChange={(e) => onFieldChange('externalSpouseName', e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
                  placeholder="Contoh: Siti (Keluarga Pratama)"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Tautkan ke Keluarga (Opsional)
                </label>
                <select 
                  value={formData.externalFamilyId || ''}
                  onChange={(e) => onFieldChange('externalFamilyId', e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 appearance-none"
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
    </div>
  );
};
