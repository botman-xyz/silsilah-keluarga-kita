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
  }, []);

  const handleZoomOut = useCallback(() => {
    console.log('ZoomOut clicked', { svgRef: !!svgRef.current, zoomRef: !!zoomRef.current });
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy(0.7));
    }
  }, []);

  const handleResetZoom = useCallback(() => {
    console.log('ResetZoom clicked', { svgRef: !!svgRef.current, zoomRef: !!zoomRef.current, membersLength: members.length });
    if (svgRef.current && zoomRef.current) {
      // Reset to identity transform (no zoom, centered)
      d3.select(svgRef.current)
        .transition()
        .duration(750)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
  }, []);

  return {
    handleZoomIn,
    handleZoomOut,
    handleResetZoom
  };
}