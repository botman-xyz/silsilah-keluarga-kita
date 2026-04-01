/**
 * ReactFlow Tree Component
 * Family tree visualization using ReactFlow with Dagre layout
 */

import React, { useMemo, useCallback, useEffect } from 'react';
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
  useReactFlow,
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
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

// Dagre layout configuration
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = 'TB'
): { nodes: Node[]; edges: Edge[] } => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: isHorizontal ? 80 : 150,
    ranksep: isHorizontal ? 150 : 80,
    marginx: 50,
    marginy: 50,
  });

  nodes.forEach((node) => {
    const isCouple = node.type === 'couple';
    const width = isCouple ? 380 : 180;
    const height = 100;
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const isCouple = node.type === 'couple';
    const width = isCouple ? 380 : 180;
    const height = 100;

    node.position = {
      x: nodeWithPosition.x - width / 2,
      y: nodeWithPosition.y - height / 2,
    };
  });

  return { nodes, edges };
};

export const ReactFlowTree: React.FC<ReactFlowTreeProps> = ({
  members,
  searchTerm = '',
  onSelectMember,
  onAddRelative,
  treePov = 'suami',
}) => {
  const { fitView } = useReactFlow();

  // Convert tree hierarchy to ReactFlow nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const treeData = buildTreeHierarchy(members, treePov);
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Recursive function to process tree nodes
    const processNode = (treeNode: TreeNode) => {
      if (treeNode.isVirtual) {
        // Process virtual root's children
        treeNode.children.forEach((child) => {
          processNode(child);
        });
        return;
      }

      const nodeId = treeNode.id;
      const isCouple = treeNode.type === 'couple' && treeNode.spouse;

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
        position: { x: 0, y: 0 }, // Will be set by dagre
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
        processNode(child);
      });
    };

    processNode(treeData);

    // Apply dagre layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      'TB' // Top to Bottom layout
    );

    return { initialNodes: layoutedNodes, initialEdges: layoutedEdges };
  }, [members, treePov, searchTerm, onSelectMember, onAddRelative]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when dependencies change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Fit view when nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 300 });
      }, 100);
    }
  }, [nodes, fitView]);

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
