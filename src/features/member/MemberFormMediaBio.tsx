import React from 'react';
import { Member } from '../../types';
import { 
  Image, 
  FileText, 
  Trash2, 
  Plus
} from 'lucide-react';

interface MediaBioProps {
  formData: Partial<Member>;
  onFieldChange: (field: keyof Member, value: any) => void;
  onAddMedia: () => void;
  onRemoveMedia: (index: number) => void;
}

export const MediaSection: React.FC<MediaBioProps> = ({
  formData,
  onAddMedia,
  onRemoveMedia,
}) => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-orange-800 uppercase tracking-wider flex items-center gap-2">
          <Image className="w-4 h-4" />
          Arsip & Galeri
        </h4>
        <button 
          type="button"
          onClick={onAddMedia}
          className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Media
        </button>
      </div>
      
      <div className="space-y-3">
        {formData.media && formData.media.length > 0 ? (
          formData.media.map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-3 p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-orange-300 transition-colors"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                item.type === 'image' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-orange-100 text-orange-600'
              }`}>
                {item.type === 'image' ? <Image className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-700 truncate">{item.name}</div>
                <div className="text-xs text-slate-400 truncate">{item.url}</div>
              </div>
              <button 
                type="button"
                onClick={() => onRemoveMedia(idx)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
            <Image className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-400">Belum ada arsip digital</p>
            <p className="text-xs text-slate-300 mt-1">Klik "Tambah Media" untuk menambahkan</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export const BioSection: React.FC<MediaBioProps> = ({
  formData,
  onFieldChange,
}) => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
      <h4 className="text-sm font-bold text-teal-800 uppercase tracking-wider mb-4 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Biografi
      </h4>
      
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Cerita Singkat
        </label>
        <textarea 
          value={formData.bio || ''}
          onChange={(e) => onFieldChange('bio', e.target.value)}
          className="w-full px-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 h-40 resize-none transition-all duration-200"
          placeholder="Ceritakan kisah hidup, pencapaian, atau hal-hal menarik tentang anggota keluarga ini..."
        />
      </div>
    </div>
  </div>
);
