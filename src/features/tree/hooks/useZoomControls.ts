import { useCallback } from 'react';
import * as d3 from 'd3';

interface UseZoomControlsProps {
  svgRef: React.RefObject<SVGSVGElement>;
  zoomRef: React.RefObject<any>;
  members: any[];
  dimensions: { width: number; height: number };
}

export function useZoomControls({ svgRef, zoomRef, members, dimensions }: UseZoomControlsProps) {
  const handleZoomIn = useCallback(() => {
    console.log('ZoomIn clicked', { svgRef: !!svgRef.current, zoomRef: !!zoomRef.current });
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy(1.3));
    }
  }, [svgRef, zoomRef]);

  const handleZoomOut = useCallback(() => {
    console.log('ZoomOut clicked', { svgRef: !!svgRef.current, zoomRef: !!zoomRef.current });
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy(0.7));
    }
  }, [svgRef, zoomRef]);

  const handleResetZoom = useCallback(() => {
    if (svgRef.current && zoomRef.current && members.length > 0) {
      // Import here to avoid circular dependency
      import('../treeBuilder').then(({ buildTreeHierarchy }) => {
        import('../treeRendering').then(({ fitTreeToView }) => {
          const treeData = buildTreeHierarchy(members);
          const hierarchy = d3.hierarchy(treeData);
          d3.tree().nodeSize([200*2+80, 90+140])(hierarchy);
          const nodes = hierarchy.descendants().filter((d: any) => !d.data.isVirtual);
          fitTreeToView(d3.select(svgRef.current!), zoomRef.current, nodes, dimensions.width, dimensions.height);
        });
      });
    }
  }, [svgRef, zoomRef, members, dimensions]);

  return {
    handleZoomIn,
    handleZoomOut,
    handleResetZoom
  };
}