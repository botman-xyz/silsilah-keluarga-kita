/**
 * Tree Controls Component
 * Zoom and pan controls for the family tree
 */

import { LucideIcon, ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface TreeControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitToScreen: () => void;
  zoomLevel: number;
}

export const TreeControls: React.FC<TreeControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onFitToScreen,
  zoomLevel
}) => {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
      <button
        onClick={onZoomIn}
        className="w-10 h-10 bg-white rounded-lg shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-5 h-5 text-slate-600" />
      </button>
      
      <button
        onClick={onZoomOut}
        className="w-10 h-10 bg-white rounded-lg shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-5 h-5 text-slate-600" />
      </button>
      
      <button
        onClick={onFitToScreen}
        className="w-10 h-10 bg-white rounded-lg shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
        title="Fit to Screen"
      >
        <Maximize2 className="w-5 h-5 text-slate-600" />
      </button>
      
      <button
        onClick={onReset}
        className="w-10 h-10 bg-white rounded-lg shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
        title="Reset View"
      >
        <RotateCcw className="w-5 h-5 text-slate-600" />
      </button>

      <div className="bg-white rounded-lg shadow-md border border-slate-200 px-3 py-1 text-center">
        <span className="text-sm font-medium text-slate-600">
          {Math.round(zoomLevel * 100)}%
        </span>
      </div>
    </div>
  );
};

export default TreeControls;