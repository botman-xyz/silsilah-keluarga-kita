import React, { useState } from 'react';
import { Family } from '../../types';

interface FamilyFormProps {
  initialData: Partial<Family>;
  onSave: (data: Partial<Family>) => void;
  onCancel: () => void;
}

export function FamilyForm({ initialData, onSave, onCancel }: FamilyFormProps) {
  const [name, setName] = useState(initialData.name || '');

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Nama Grup Keluarga</label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="Contoh: Keluarga Besar Jatmiko"
          autoFocus
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
          onClick={() => onSave({ name })}
          className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
        >
          Simpan Keluarga
        </button>
      </div>
    </div>
  );
}
