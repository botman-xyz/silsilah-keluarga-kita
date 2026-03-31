import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Member } from '../../domain/entities';
import { ZoomControls } from './ZoomControls';
import { buildTreeHierarchy } from './treeBuilder';
import { renderTree, fitTreeToView } from './treeRendering';
import { getLayoutConfig } from './treeLayout';
import { ZoomIn, ZoomOut, Maximize, MousePointer2, Eye, EyeOff } from 'lucide-react';

interface FamilyTreeProps {
  members: Member[];
  searchTerm?: string;
  onSelectMember: (member: Member) => void;
  onAddRelative?: (member: Member) => void;
  onFamilySelect?: (familyId: string) => void;
  isHeaderHidden?: boolean;
  onToggleHeader?: () => void;
  treePov?: 'suami' | 'istri';
}

export default function FamilyTree({ 
  members, 
  searchTerm = "", 
  onSelectMember, 
  onAddRelative,
  isHeaderHidden = false,
  onToggleHeader
}: FamilyTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<any>(null);
  const memberPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  const [zoomLevel, setZoomLevel] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isRendering, setIsRendering] = useState(false);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(-1);
  const [localTreePov, setTreePov] = useState<'suami' | 'istri'>('suami');

  const isLargeTree = members.length > 100;

  // Update dimensions
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Render tree
  useEffect(() => {
    if (!svgRef.current || members.length === 0 || dimensions.width === 0) return;
    
    if (isLargeTree) setIsRendering(true);

    const zoom = renderTree(d3.select(svgRef.current), {
      width: dimensions.width,
      height: dimensions.height,
      members,
      searchTerm,
      onSelectMember,
      onAddRelative,
      isLargeTree
    }, memberPositionsRef);

    if (zoom) {
      zoomRef.current = zoom;
      zoom.on("zoom", (event: any) => setZoomLevel(event.transform.k));
      
      // Fit to view after render
      setTimeout(() => {
        if (svgRef.current && zoomRef.current) {
          const treeData = buildTreeHierarchy(members);
            const hierarchy = d3.hierarchy(treeData);
            const treeLayout = d3.tree<any>().nodeSize([200*2+80, 90+140]);
            treeLayout(hierarchy);
            const nodes = hierarchy.descendants().filter((d: any) => !d.data.isVirtual) as any[];
          fitTreeToView(d3.select(svgRef.current), zoom, nodes, dimensions.width, dimensions.height);
        }
        setIsRendering(false);
      }, 100);
    }
  }, [members, dimensions, searchTerm]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      const nodes = members;
      let idx = selectedNodeIndex;
      
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        idx = Math.min(idx + 1, nodes.length - 1);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        idx = Math.max(idx - 1, 0);
      } else if (e.key === 'Enter' || e.key === 'o') {
        e.preventDefault();
        if (idx >= 0 && idx < nodes.length) onSelectMember(nodes[idx]);
      } else if (e.key === 'Escape') {
        idx = -1;
      }
      
      if (idx !== selectedNodeIndex) {
        setSelectedNodeIndex(idx);
        const node = nodes[idx];
        if (node && svgRef.current && zoomRef.current) {
          const pos = memberPositionsRef.current.get(node.id);
          if (pos) {
            const svg = d3.select(svgRef.current);
            const w = containerRef.current?.clientWidth || 800;
            const h = containerRef.current?.clientHeight || 600;
            svg.transition().duration(300).call(
              zoomRef.current.transform,
              d3.zoomIdentity.translate(w/2 - pos.x * zoomLevel, h/2 - pos.y * zoomLevel).scale(zoomLevel)
            );
          }
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [members, selectedNodeIndex, onSelectMember, zoomLevel]);

  const handleZoomIn = () => svgRef.current && zoomRef.current && d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.3);
  const handleZoomOut = () => svgRef.current && zoomRef.current && d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
  const handleResetZoom = () => {
    if (svgRef.current && zoomRef.current && members.length > 0) {
      const treeData = buildTreeHierarchy(members);
      const hierarchy = d3.hierarchy(treeData);
      d3.tree().nodeSize([200*2+80, 90+140])(hierarchy);
      const nodes = hierarchy.descendants().filter(d => !d.data.isVirtual);
      fitTreeToView(d3.select(svgRef.current), zoomRef.current, nodes, dimensions.width, dimensions.height);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative">
      {isRendering && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50/90">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm font-medium text-slate-600">Merender silsilah...</span>
          </div>
        </div>
      )}
      
      <div className="overflow-auto w-full h-full scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <div className="min-w-[3000px] min-h-[2000px] relative">
          <svg ref={svgRef} className="w-full h-full family-tree-svg absolute top-0 left-0" tabIndex={0} />
        </div>
      </div>
      
      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 flex flex-col gap-1">
          <button onClick={handleZoomIn} className="p-2.5 hover:bg-slate-50 text-slate-600 rounded-xl" title="Perbesar">
            <ZoomIn className="w-5 h-5" />
          </button>
          <div className="h-px bg-slate-100 mx-2" />
          <button onClick={handleZoomOut} className="p-2.5 hover:bg-slate-50 text-slate-600 rounded-xl" title="Perkecil">
            <ZoomOut className="w-5 h-5" />
          </button>
          <div className="h-px bg-slate-100 mx-2" />
          <button onClick={handleResetZoom} className="p-2.5 hover:bg-slate-50 text-slate-600 rounded-xl" title="Fit ke Layar">
            <Maximize className="w-5 h-5" />
          </button>
          {onToggleHeader && (
            <>
              <div className="h-px bg-slate-100 mx-2" />
              <button onClick={onToggleHeader} className="p-2.5 hover:bg-slate-50 text-slate-600 rounded-xl">
                {isHeaderHidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-400 text-center">
          {Math.round(zoomLevel * 100)}%
        </div>
      </div>

      {/* Tip */}
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2 pointer-events-none">
        <MousePointer2 className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[10px] font-medium text-slate-500">Geser & Zoom untuk navigasi</span>
      </div>
    </div>
  );
}
