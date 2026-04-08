/**
 * Tree Connection Component - Atom Level
 * Renders SVG path connections between parent-child nodes
 */

import React from 'react';

export interface ConnectionData {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  type: 'vertical' | 'horizontal' | 'elbow';
}

interface TreeConnectionProps {
  connections: ConnectionData[];
  options?: TreeConnectionOptions;
}

interface TreeConnectionOptions {
  strokeColor?: string;
  strokeWidth?: number;
  animated?: boolean;
}

export const TreeConnection = ({ 
  connections,
  options = {}
}: TreeConnectionProps): React.ReactElement => {
  const {
    strokeColor = "#94a3b8",
    strokeWidth = 2,
    animated = false
  } = options;

  const renderPath = (conn: ConnectionData): string => {
    const { sourceX, sourceY, targetX, targetY, type } = conn;
    
    if (type === 'vertical') {
      // Direct vertical line
      return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    } else if (type === 'horizontal') {
      // Direct horizontal line
      return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    } else {
      // Elbow connector (L-shape)
      const midY = (sourceY + targetY) / 2;
      return `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
    }
  };

  return (
    <g className="tree-connections">
      {connections.map((conn, index) => (
        <path
          key={`connection-${index}`}
          d={renderPath(conn)}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            ...(animated ? { 
              animation: 'dash 1s linear infinite',
              strokeDasharray: '5,5'
            } : {})
          }}
        />
      ))}
    </g>
  );
};

/**
 * Single connection component - more granular control
 */
interface SingleConnectionProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  type?: 'straight' | 'elbow';
  highlighted?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
}

export const SingleConnection: React.FC<SingleConnectionProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  type = 'elbow',
  highlighted = false,
  onHover,
  onLeave
}) => {
  const path = type === 'straight'
    ? `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`
    : `M ${sourceX} ${sourceY} L ${sourceX} ${(sourceY + targetY) / 2} L ${targetX} ${(sourceY + targetY) / 2} L ${targetX} ${targetY}`;

  return (
    <path
      d={path}
      fill="none"
      stroke={highlighted ? "#3b82f6" : "#94a3b8"}
      strokeWidth={highlighted ? 3 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{ cursor: 'pointer', transition: 'stroke 0.2s, stroke-width 0.2s' }}
    />
  );
};

export default TreeConnection;