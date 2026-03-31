// Zoom Controls Component for FamilyTree
// Separated for better maintainability

import { ZoomIn, ZoomOut, Maximize, Eye, EyeOff, Users } from 'lucide-react';

interface ZoomControlsProps {
  zoomLevel: number;
  isHeaderHidden?: boolean;
  treePov?: 'suami' | 'istri';
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleHeader?: () => void;
  onTogglePov?: (pov: 'suami' | 'istri') => void;
}

export function ZoomControls({
  zoomLevel,
  isHeaderHidden = false,
  treePov = 'suami',
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleHeader,
  onTogglePov
}: ZoomControlsProps) {
  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-2">
      {/* POV Toggle */}
      {onTogglePov && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 flex flex-col gap-1">
          <button 
            onClick={() => onTogglePov(treePov === 'suami' ? 'istri' : 'suami')}
            className="p-2.5 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors flex flex-col items-center gap-0.5"
            title={`POV: ${treePov === 'suami' ? 'Suami di kiri' : 'Istri di kiri'}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[8px] font-bold">
              {treePov === 'suami' ? '👨' : '👩'}
            </span>
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 flex flex-col gap-1">
        <button 
          onClick={onZoomIn}
          className="p-2.5 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
          title="Perbesar"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <div className="h-px bg-slate-100 mx-2" />
        <button 
          onClick={onZoomOut}
          className="p-2.5 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
          title="Perkecil"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <div className="h-px bg-slate-100 mx-2" />
        <button 
          onClick={onResetZoom}
          className="p-2.5 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
          title="Fit ke Layar"
        >
          <Maximize className="w-5 h-5" />
        </button>
        {onToggleHeader && (
          <>
            <div className="h-px bg-slate-100 mx-2" />
            <button 
              onClick={onToggleHeader}
              className="p-2.5 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
              title={isHeaderHidden ? "Tampilkan Menu" : "Sembunyikan Menu"}
            >
              {isHeaderHidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-400 text-center">
        {Math.round(zoomLevel * 100)}%
      </div>
    </div>
  );
}