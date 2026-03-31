/**
 * useTreeState Hook - Molecule Level
 * Manages tree visualization state (zoom, pan, selection)
 */

import { useState, useCallback, useMemo } from 'react';
import { Member } from '../../domain/entities';

export interface TreeViewport {
  x: number;
  y: number;
  scale: number;
}

export interface TreeSelection {
  memberId: string | null;
  nodeIds: string[];
}

interface UseTreeStateOptions {
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
}

export const useTreeState = (options: UseTreeStateOptions = {}) => {
  const {
    initialScale = 1,
    minScale = 0.1,
    maxScale = 5
  } = options;

  // Viewport state (pan & zoom)
  const [viewport, setViewport] = useState<TreeViewport>({
    x: 0,
    y: 0,
    scale: initialScale
  });

  // Selection state
  const [selection, setSelection] = useState<TreeSelection>({
    memberId: null,
    nodeIds: []
  });

  // Search/filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMemberIds, setFilteredMemberIds] = useState<Set<string>>(new Set());

  // Actions
  const zoomIn = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      scale: Math.min(prev.scale * 1.2, maxScale)
    }));
  }, [maxScale]);

  const zoomOut = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      scale: Math.max(prev.scale / 1.2, minScale)
    }));
  }, [minScale]);

  const resetView = useCallback(() => {
    setViewport({ x: 0, y: 0, scale: initialScale });
  }, [initialScale]);

  const setScale = useCallback((scale: number) => {
    setViewport(prev => ({
      ...prev,
      scale: Math.max(minScale, Math.min(maxScale, scale))
    }));
  }, [minScale, maxScale]);

  const pan = useCallback((deltaX: number, deltaY: number) => {
    setViewport(prev => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  }, []);

  const selectMember = useCallback((member: Member | null) => {
    setSelection(prev => ({
      ...prev,
      memberId: member?.id || null
    }));
  }, []);

  const selectNodes = useCallback((nodeIds: string[]) => {
    setSelection(prev => ({
      ...prev,
      nodeIds
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelection({ memberId: null, nodeIds: [] });
  }, []);

  // Search/filter actions
  const search = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const filterMembers = useCallback((members: Member[], term: string) => {
    if (!term) {
      setFilteredMemberIds(new Set());
      return;
    }
    const lowerTerm = term.toLowerCase();
    const matched = members
      .filter(m => m.name.toLowerCase().includes(lowerTerm))
      .map(m => m.id);
    setFilteredMemberIds(new Set(matched));
  }, []);

  // Computed values
  const hasSelection = useMemo(() => 
    selection.memberId !== null || selection.nodeIds.length > 0,
    [selection]
  );

  const isSearchActive = useMemo(() => 
    searchTerm.length > 0,
    [searchTerm]
  );

  const selectedMemberIds = useMemo(() => 
    selection.memberId ? [selection.memberId] : selection.nodeIds,
    [selection]
  );

  return {
    // State
    viewport,
    selection,
    searchTerm,
    filteredMemberIds,
    
    // Computed
    hasSelection,
    isSearchActive,
    selectedMemberIds,
    
    // Actions
    zoomIn,
    zoomOut,
    resetView,
    setScale,
    pan,
    selectMember,
    selectNodes,
    clearSelection,
    search,
    filterMembers
  };
};

export default useTreeState;