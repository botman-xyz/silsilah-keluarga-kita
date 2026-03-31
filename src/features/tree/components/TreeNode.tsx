/**
 * Tree Node Component - Organism Level
 * Renders a single node in the family tree (individual or couple)
 */

import React from 'react';
import { Member } from '../../../domain/entities';

export interface TreeNodeData {
  id: string;
  type: 'couple' | 'individual';
  member?: Member;
  spouse?: Member;
  x?: number;
  y?: number;
}

interface TreeNodeProps {
  node: TreeNodeData;
  x: number;
  y: number;
  options: {
    nodeWidth: number;
    nodeHeight: number;
    isMobile: boolean;
    onSelectMember: (member: Member) => void;
    onAddRelative?: (member: Member) => void;
  };
  isMantu?: boolean;
  searchTerm?: string;
}

export const TreeNode: React.FC<TreeNodeProps> = ({ 
  node, 
  x, 
  y, 
  options,
  isMantu = false,
  searchTerm = ''
}) => {
  const { nodeWidth, nodeHeight, isMobile, onSelectMember, onAddRelative } = options;
  const member = node.member;
  const spouse = node.spouse;

  if (!member) return null;

  const isMatch = searchTerm && member.name.toLowerCase().includes(searchTerm.toLowerCase());
  const accentColor = member.gender === 'male' ? "#3b82f6" : member.gender === 'female' ? "#ec4899" : "#94a3b8";
  const bgColor = member.gender === 'male' ? "#eff6ff" : member.gender === 'female' ? "#fdf2f8" : "#f8fafc";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectMember(member);
  };

  const handleAddRelative = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddRelative?.(member);
  };

  // Render couple node (two members side by side)
  if (node.type === 'couple' && spouse) {
    return (
      <g transform={`translate(${x}, ${y})`} onClick={handleClick} style={{ cursor: 'pointer' }}>
        {/* Left member card */}
        <rect
          x={-nodeWidth - 4}
          y={-nodeHeight / 2}
          width={nodeWidth}
          height={nodeHeight}
          rx={isMobile ? 12 : 16}
          fill={isMantu ? "#fffbeb" : "white"}
          stroke={isMatch ? "#3b82f6" : isMantu ? "#f59e0b" : "#f1f5f9"}
          strokeWidth={isMatch ? 3 : isMantu ? 2 : 1}
          style={{ filter: 'drop-shadow(0 10px 15px -3px rgb(0 0 0 / 0.05))' }}
        />
        {/* Top accent */}
        <path
          d={`M${-nodeWidth - 4 + 12},${-nodeHeight/2} h${nodeWidth - 24} a4,4 0 0 1 4,4 v2 h${-nodeWidth} v-2 a4,4 0 0 1 4,-4`}
          fill={accentColor}
          opacity={0.8}
        />
        {/* Connection line between couple */}
        <line
          x1={-4}
          y1={0}
          x2={4}
          y2={0}
          stroke={accentColor}
          strokeWidth={2}
          strokeDasharray="4,2"
        />

        {/* Right member card (spouse) */}
        <rect
          x={4}
          y={-nodeHeight / 2}
          width={nodeWidth}
          height={nodeHeight}
          rx={isMobile ? 12 : 16}
          fill={isMantu ? "#fffbeb" : "white"}
          stroke={isMantu ? "#f59e0b" : "#f1f5f9"}
          strokeWidth={isMantu ? 2 : 1}
          style={{ filter: 'drop-shadow(0 10px 15px -3px rgb(0 0 0 / 0.05))' }}
        />
        <path
          d={`M${4 + 12},${-nodeHeight/2} h${nodeWidth - 24} a4,4 0 0 1 4,4 v2 h${-nodeWidth} v-2 a4,4 0 0 1 4,-4`}
          fill={spouse.gender === 'male' ? "#3b82f6" : "#ec4899"}
          opacity={0.8}
        />
      </g>
    );
  }

  // Render individual node
  return (
    <g transform={`translate(${x}, ${y})`} onClick={handleClick} style={{ cursor: 'pointer' }}>
      {/* Card background */}
      <rect
        x={-nodeWidth / 2}
        y={-nodeHeight / 2}
        width={nodeWidth}
        height={nodeHeight}
        rx={isMobile ? 12 : 16}
        fill={isMantu ? "#fffbeb" : "white"}
        stroke={isMatch ? "#3b82f6" : isMantu ? "#f59e0b" : "#f1f5f9"}
        strokeWidth={isMatch ? 3 : isMantu ? 2 : 1}
        style={{ filter: 'drop-shadow(0 10px 15px -3px rgb(0 0 0 / 0.05))' }}
      />
      
      {/* Top accent bar */}
      <path
        d={`M${-nodeWidth/2 + 12},${-nodeHeight/2} h${nodeWidth - 24} a4,4 0 0 1 4,4 v2 h${-nodeWidth} v-2 a4,4 0 0 1 4,-4`}
        fill={accentColor}
        opacity={0.8}
      />

      {/* Quick add button */}
      {onAddRelative && (
        <g 
          transform={`translate(${nodeWidth/2 - 14}, ${-nodeHeight/2 + 14})`}
          onClick={handleAddRelative}
          style={{ opacity: isMobile ? 1 : 0 }}
        >
          <circle r={10} fill="white" stroke="#f1f5f9" strokeWidth={1} />
          <path d="M-3 0 h6 M0 -3 v6" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" />
        </g>
      )}

      {/* Search highlight */}
      {isMatch && (
        <rect
          x={-nodeWidth/2 - 4}
          y={-nodeHeight/2 - 4}
          width={nodeWidth + 8}
          height={nodeHeight + 8}
          rx={16}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={3}
          style={{ animation: 'pulse 2s infinite' }}
        />
      )}
    </g>
  );
};

export default TreeNode;