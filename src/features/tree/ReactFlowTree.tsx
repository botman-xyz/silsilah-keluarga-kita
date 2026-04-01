/**
 * ReactFlow Tree Component
 * Family tree visualization using ReactFlow
 */

import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Member } from '../../domain/entities';
import { buildTreeHierarchy, TreeNode } from './treeBuilder';
import { FamilyMemberNode } from './components/FamilyMemberNode';
import { CoupleNode } from './components/CoupleNode';

interface ReactFlowTreeProps {
  members: Member[];
  searchTerm?: string;
  onSelectMember: (member: Member) => void;
  onAddRelative?: (member: Member) => void;
  treePov?: 'suami' | 'istri';
}

// Custom node types
const nodeTypes = {
  familyMember: FamilyMemberNode,
  couple: CoupleNode,
};

export const ReactFlowTree: React.FC<ReactFlowTreeProps> = ({
  members,
  searchTerm = '',
  onSelectMember,
  onAddRelative,
  treePov = 'suami',
}) => {
  // Convert tree hierarchy to ReactFlow nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const treeData = buildTreeHierarchy(members, treePov);
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Calculate layout using dagre-like approach
    const nodeWidth = 180;
    const nodeHeight = 100;
    const horizontalSpacing = 80;
    const verticalSpacing = 150;

    // Track node positions
    const nodePositions = new Map<string, { x: number; y: number }>();

    // Recursive function to process tree nodes
    const processNode = (
      treeNode: TreeNode,
      depth: number = 0,
      index: number = 0,
      parentX: number = 0
    ): { x: number; y: number; width: number } => {
      if (treeNode.isVirtual) {
        // Process virtual root's children
        let currentX = 0;
        treeNode.children.forEach((child, idx) => {
          const result = processNode(child, 0, idx, currentX);
          currentX += result.width + horizontalSpacing;
        });
        return { x: 0, y: 0, width: currentX };
      }

      const nodeId = treeNode.id;
      const isCouple = treeNode.type === 'couple' && treeNode.spouse;
      const width = isCouple ? nodeWidth * 2 + 20 : nodeWidth;

      // Calculate position
      let x = parentX;
      let y = depth * verticalSpacing;

      // If has children, center parent above children
      if (treeNode.children.length > 0) {
        let childX = x;
        const childResults: { x: number; y: number; width: number }[] = [];

        treeNode.children.forEach((child, idx) => {
          const result = processNode(child, depth + 1, idx, childX);
          childResults.push(result);
          childX += result.width + horizontalSpacing;
        });

        // Center parent above children
        const firstChild = childResults[0];
        const lastChild = childResults[childResults.length - 1];
        x = (firstChild.x + lastChild.x) / 2;
      }

      nodePositions.set(nodeId, { x, y });

      // Create ReactFlow node
      const nodeData: any = {
        member: treeNode.member,
        spouse: treeNode.spouse,
        onSelectMember,
        onAddRelative,
        searchTerm,
      };

      nodes.push({
        id: nodeId,
        type: isCouple ? 'couple' : 'familyMember',
        position: { x, y },
        data: nodeData,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });

      // Create edges to children
      treeNode.children.forEach((child) => {
        edges.push({
          id: `${nodeId}-${child.id}`,
          source: nodeId,
          target: child.id,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#94a3b8',
            width: 20,
            height: 20,
          },
        });
      });

      return { x, y, width };
    };

    processNode(treeData);

    return { initialNodes: nodes, initialEdges: edges };
  }, [members, treePov, searchTerm, onSelectMember, onAddRelative]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when dependencies change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // Node click is handled by the custom node components
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        attributionPosition="bottom-left"
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const member = node.data?.member as Member;
            if (!member) return '#94a3b8';
            return member.gender === 'male' ? '#3b82f6' : member.gender === 'female' ? '#ec4899' : '#94a3b8';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          style={{ backgroundColor: '#f8fafc' }}
        />
      </ReactFlow>
    </div>
  );
};

export default ReactFlowTree;
