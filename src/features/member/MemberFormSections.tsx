import React from 'react';
import { Member } from '../../types';
import { 
  User, 
  Calendar, 
  AlertCircle
} from 'lucide-react';
import { FormErrors } from './memberValidation';

interface SectionProps {
  formData: Partial<Member>;
  errors: FormErrors;
  touched: Record<string, boolean>;
  onFieldChange: (field: keyof Member, value: any) => void;
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

export const BasicSection: React.FC<SectionProps> = ({
  formData,
  errors,
  touched,
  onFieldChange,
}) => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
      <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-4 flex items-center gap-2">
        <User className="w-4 h-4" />
        Informasi Dasar
      </h4>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            value={formData.name || ''}
            onChange={(e) => onFieldChange('name', e.target.value)}
            className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl outline-none transition-all duration-200 ${
              errors.name && touched.name 
                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            }`}
            placeholder="Masukkan nama lengkap"
          />
          {renderFieldError(errors, touched, 'name')}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Jenis Kelamin <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'male', label: 'Laki-laki', icon: '👨' },
              { value: 'female', label: 'Perempuan', icon: '👩' }
            ].map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => onFieldChange('gender', option.value)}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.gender === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md shadow-blue-100'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-2xl">{option.icon}</span>
                <span className="font-semibold">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Status Perkawinan
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'single', label: 'Lajang', icon: '💍' },
              { id: 'married', label: 'Menikah', icon: '💑' },
              { id: 'divorced', label: 'Cerai', icon: '💔' },
              { id: 'widowed', label: 'Janda/Duda', icon: '🕊️' }
            ].map(status => (
              <button
                key={status.id}
                type="button"
                onClick={() => onFieldChange('maritalStatus', status.id)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                  formData.maritalStatus === status.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <span>{status.icon}</span>
                <span>{status.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const DatesSection: React.FC<SectionProps> = ({
  formData,
  errors,
  touched,
  onFieldChange,
}) => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
      <h4 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        Tanggal Penting
      </h4>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Tanggal Lahir
          </label>
          <input 
            type="date" 
            value={formData.birthDate || ''}
            onChange={(e) => onFieldChange('birthDate', e.target.value)}
            className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl outline-none transition-all duration-200 ${
              errors.birthDate && touched.birthDate
                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
            }`}
          />
          {renderFieldError(errors, touched, 'birthDate')}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Tanggal Wafat (Opsional)
          </label>
          <input 
            type="date" 
            value={formData.deathDate || ''}
            onChange={(e) => onFieldChange('deathDate', e.target.value)}
            className={`w-full px-4 py-3.5 bg-white border-2 rounded-xl outline-none transition-all duration-200 ${
              errors.deathDate && touched.deathDate
                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
            }`}
          />
          {renderFieldError(errors, touched, 'deathDate')}
        </div>

        {formData.maritalStatus === 'married' && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tanggal Pernikahan (Opsional)
            </label>
            <input 
              type="date" 
              value={formData.marriageDate || ''}
              onChange={(e) => onFieldChange('marriageDate', e.target.value)}
              className="w-full px-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            URL Foto (Opsional)
          </label>
          <input 
            type="url" 
            value={formData.photoUrl || ''}
            onChange={(e) => onFieldChange('photoUrl', e.target.value)}
            className="w-full px-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200"
            placeholder="https://example.com/foto.jpg"
          />
        </div>
      </div>
    </div>
  </div>
);
