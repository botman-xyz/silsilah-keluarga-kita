import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Member } from '../../domain/entities';
import { ZoomControls } from './ZoomControls';
import { buildTreeHierarchy } from './treeBuilder';
import { renderTree, fitTreeToView } from './treeRendering';
import { getLayoutConfig } from './treeLayout';
import { useZoomControls } from './hooks/useZoomControls';
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
   onTogglePov?: (pov: 'suami' | 'istri') => void;
}

export default function FamilyTree({
   members,
   searchTerm = "",
   onSelectMember,
   onAddRelative,
   isHeaderHidden = false,
   onToggleHeader,
   treePov = 'suami',
   onTogglePov
}: FamilyTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<any>(null);
  const memberPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const renderedNodesRef = useRef<any[]>([]);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isRendering, setIsRendering] = useState(false);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(-1);
  const mountedRef = useRef(true);

  const isLargeTree = members.length > 100;

  // Zoom controls hook
  const { handleZoomIn, handleZoomOut, handleResetZoom } = useZoomControls({
    svgRef,
    zoomRef,
    members,
    dimensions
  });

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      // Cleanup D3 zoom behavior
      if (zoomRef.current) {
        zoomRef.current.on("zoom", null);
      }
    };
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
       isLargeTree,
       treePov
     }, memberPositionsRef, renderedNodesRef);

    if (zoom) {
      // Remove previous zoom listener if it exists
      if (zoomRef.current) {
        zoomRef.current.on("zoom", null);
      }
      zoomRef.current = zoom;
      zoom.on("zoom", (event: any) => setZoomLevel(event.transform.k));
      
      // Fit to view after render
      setTimeout(() => {
        if (mountedRef.current && svgRef.current && zoomRef.current) {
          const treeData = buildTreeHierarchy(members, treePov);
            const hierarchy = d3.hierarchy(treeData);
            const treeLayout = d3.tree<any>().nodeSize([200*2+80, 90+140]);
            treeLayout(hierarchy);
            const nodes = hierarchy.descendants().filter((d: any) => !d.data.isVirtual) as any[];
          fitTreeToView(d3.select(svgRef.current), zoom, nodes, dimensions.width, dimensions.height);
        }
        if (mountedRef.current) setIsRendering(false);
      }, 100);
    }
  }, [members, dimensions, searchTerm, treePov]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      const nodes = renderedNodesRef.current;
      let idx = selectedNodeIndex;
      
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        idx = Math.min(idx + 1, nodes.length - 1);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        idx = Math.max(idx - 1, 0);
      } else if (e.key === 'Enter' || e.key === 'o') {
        e.preventDefault();
        if (idx >= 0 && idx < nodes.length) {
          const node = nodes[idx];
          if (node.data.member) onSelectMember(node.data.member);
          else if (node.data.spouse) onSelectMember(node.data.spouse);
        }
      } else if (e.key === 'Escape') {
        idx = -1;
      }
      
      if (idx !== selectedNodeIndex) {
        setSelectedNodeIndex(idx);
        const node = nodes[idx];
        if (node && svgRef.current && zoomRef.current) {
          const memberId = node.data.member?.id || node.data.spouse?.id;
          if (memberId) {
            const pos = memberPositionsRef.current.get(memberId);
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
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedNodeIndex, onSelectMember, zoomLevel]);


  return (
    <div ref={containerRef} className="w-full h-full bg-slate-50 rounded-xl border border-slate-200 relative">
      {isRendering && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50/90">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm font-medium text-slate-600">Merender silsilah...</span>
          </div>
        </div>
      )}
      
      <svg ref={svgRef} className="w-full h-full family-tree-svg" tabIndex={0} />
      
      <ZoomControls
        zoomLevel={zoomLevel}
        isHeaderHidden={isHeaderHidden}
        treePov={treePov}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onToggleHeader={onToggleHeader}
        onTogglePov={onTogglePov}
      />

      {/* Tip */}
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2 pointer-events-none">
        <MousePointer2 className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[10px] font-medium text-slate-500">Geser & Zoom untuk navigasi</span>
      </div>
    </div>
  );
}
