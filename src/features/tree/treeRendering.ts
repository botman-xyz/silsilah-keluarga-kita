/**
 * Tree Rendering Module
 * Handles all D3 rendering logic for the family tree
 * Separated for better maintainability (Single Responsibility Principle)
 */

import * as d3 from 'd3';
import { Member } from '../../domain/entities';
import { TreeNode } from './treeBuilder';
import { getLayoutConfig } from './treeLayout';
import { renderMemberCard as createMemberCard } from './treeRenderer';
import { renderTreeBackground } from './TreeBackground';
import { renderConnections } from './TreeConnections';

export interface TreeRenderingConfig {
  width: number;
  height: number;
  members: Member[];
  searchTerm: string;
  onSelectMember: (member: Member) => void;
  onAddRelative?: (member: Member) => void;
  treePov: 'suami' | 'istri';
  memberPositionsRef: React.MutableRefObject<Map<string, { x: number; y: number }>>;
}

export interface RenderResult {
  nodes: d3.HierarchyPointNode<TreeNode>[];
  links: d3.HierarchyPointLink<TreeNode>[];
}

/**
 * Main render function that orchestrates all D3 rendering
 */
export function renderTree(
  svgElement: d3.Selection<null, unknown, null, undefined>,
  config: TreeRenderingConfig
): RenderResult {
  const { width, height, members, searchTerm, onSelectMember, onAddRelative, treePov, memberPositionsRef } = config;
  
  // Get layout configuration
  const layout = getLayoutConfig(width, height);
  const { nodeWidth, nodeHeight, horizontalSpacing, verticalSpacing } = layout;
  const isMobile = width < 768;

  // Setup SVG
  const svg = svgElement
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const g = svg.append("g");

  // Render grid background
  renderGridBackground(g, isMobile);

  // Build tree data
  const { virtualRoot } = buildVirtualTree(members);

  // Create hierarchy
  const hierarchy = d3.hierarchy(virtualRoot);
  
  // Layout
  const treeLayout = d3.tree<TreeNode>()
    .nodeSize([nodeWidth * 2 + horizontalSpacing, nodeHeight + verticalSpacing]);
  
  treeLayout(hierarchy);

  // Filter nodes and links
  const nodes = hierarchy.descendants().filter(d => !d.data.isVirtual) as d3.HierarchyPointNode<TreeNode>[];
  const links = hierarchy.links().filter(l => 
    !l.source.data.isVirtual && !l.target.data.isVirtual
  ) as d3.HierarchyPointLink<TreeNode>[];

  // Store positions for keyboard navigation
  nodes.forEach(d => {
    if (d.data.member?.id) {
      memberPositionsRef.current.set(d.data.member.id, { x: d.x, y: d.y });
    }
  });

  // Render generation backgrounds
  renderGenerationBackgrounds(g, nodes, nodeHeight, isMobile);

  // Render connections
  renderTreeConnections(g, links, nodeWidth, nodeHeight);

  // Render member nodes
  renderTreeNodes(g, nodes, {
    nodeWidth,
    nodeHeight,
    isMobile,
    searchTerm,
    onSelectMember,
    onAddRelative
  });

  return { nodes, links };
}

/**
 * Build virtual tree structure from members
 */
function buildVirtualTree(members: Member[]) {
  // Import dynamically to avoid circular dependencies
  const { buildTreeHierarchy } = require('./treeBuilder');
  return buildTreeHierarchy(members);
}

/**
 * Render grid background
 */
function renderGridBackground(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  isMobile: boolean
) {
  const gridSize = 40;
  const gridLimit = 5000;
  const gridGroup = g.append("g").attr("class", "grid-bg");
  
  for (let i = -gridLimit; i <= gridLimit; i += gridSize) {
    gridGroup.append("line")
      .attr("x1", i).attr("y1", -gridLimit)
      .attr("x2", i).attr("y2", gridLimit)
      .attr("stroke", "#f1f5f9").attr("stroke-width", 1);
    gridGroup.append("line")
      .attr("x1", -gridLimit).attr("y1", i)
      .attr("x2", gridLimit).attr("y2", i)
      .attr("stroke", "#f1f5f9").attr("stroke-width", 1);
  }
}

/**
 * Render generation backgrounds
 */
function renderGenerationBackgrounds(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: d3.HierarchyPointNode<TreeNode>[],
  nodeHeight: number,
  isMobile: boolean
) {
  const gridLimit = 5000;
  const depths = Array.from(new Set(nodes.map(d => d.depth)));
  
  depths.forEach(depth => {
    const nodesAtDepth = nodes.filter(d => d.depth === depth);
    if (nodesAtDepth.length === 0) return;
    
    const y = nodesAtDepth[0].y;
    g.insert("rect", ":first-child")
      .attr("x", -gridLimit)
      .attr("y", y - nodeHeight/2 - 30)
      .attr("width", gridLimit * 2)
      .attr("height", nodeHeight + 60)
      .attr("fill", depth % 2 === 0 ? "#f8fafc" : "transparent")
      .attr("opacity", 0.5)
      .attr("rx", 20);

    g.append("text")
      .attr("x", Math.min(...nodesAtDepth.map(n => n.x)) - 200)
      .attr("y", y)
      .attr("dy", "0.35em")
      .attr("class", "text-[10px] font-black uppercase tracking-[0.2em] fill-slate-300")
      .attr("text-anchor", "end")
      .text(`GEN ${depth}`);
  });
}

/**
 * Render tree connections
 */
function renderTreeConnections(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  links: d3.HierarchyPointLink<TreeNode>[],
  nodeWidth: number,
  nodeHeight: number
) {
  const linkGenerator = d3.linkVertical<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
    .x((d: any) => d.x)
    .y((d: any) => d.y);

  g.selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", (d: any) => {
      const sourceType = d.source.data.type;
      const targetType = d.target.data.type;
      
      if (sourceType === 'couple' && targetType === 'individual') return "#94a3b8";
      if (sourceType === 'couple' && targetType === 'couple') return "#64748b";
      return "#cbd5e1";
    })
    .attr("stroke-width", 2.5)
    .attr("stroke-dasharray", (d: any) => d.target.data.type === 'couple' ? "0" : "5,3")
    .attr("d", (d: any) => {
      const sourceX = d.source.x;
      const sourceY = d.source.y + nodeHeight / 2;
      const targetX = d.target.x;
      const targetY = d.target.y - nodeHeight / 2;
      const midY = (sourceY + targetY) / 2;
      return `M${sourceX},${sourceY} C${sourceX},${midY} ${targetX},${midY} ${targetX},${targetY}`;
    })
    .style("transition", "stroke 0.3s ease, stroke-width 0.3s ease")
    .style("opacity", 0.9)
    .on("mouseenter", function() { 
      d3.select(this).attr("stroke", "#3b82f6").attr("stroke-width", 4); 
    })
    .on("mouseleave", function() { 
      d3.select(this).attr("stroke", "#94a3b8").attr("stroke-width", 2.5); 
    });
}

/**
 * Render tree nodes
 */
function renderTreeNodes(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: d3.HierarchyPointNode<TreeNode>[],
  config: {
    nodeWidth: number;
    nodeHeight: number;
    isMobile: boolean;
    searchTerm: string;
    onSelectMember: (member: Member) => void;
    onAddRelative?: (member: Member) => void;
  }
) {
  const { nodeWidth, nodeHeight, isMobile, searchTerm, onSelectMember, onAddRelative } = config;

  // Draw family unit backgrounds
  const familyUnits = nodes.filter(d => d.children && d.children.length > 0);
  g.selectAll(".family-unit-bg")
    .data(familyUnits)
    .enter()
    .insert("rect", ":first-child")
    .attr("x", (d: any) => {
      const childX = d.children.map((c: any) => c.x);
      const minX = Math.min(d.x, ...childX) - (d.data.type === 'couple' ? nodeWidth : nodeWidth/2) - 15;
      return minX;
    })
    .attr("y", (d: any) => d.y - nodeHeight/2 - 15)
    .attr("width", (d: any) => {
      const childX = d.children.map((c: any) => c.x);
      const minX = Math.min(d.x, ...childX) - (d.data.type === 'couple' ? nodeWidth : nodeWidth/2) - 15;
      const maxX = Math.max(d.x, ...childX) + (d.data.type === 'couple' ? nodeWidth : nodeWidth/2) + 15;
      return maxX - minX;
    })
    .attr("height", (d: any) => {
      const maxY = Math.max(...d.children.map((c: any) => c.y)) + nodeHeight/2 + 15;
      return maxY - (d.y - nodeHeight/2 - 15);
    })
    .attr("rx", 20)
    .attr("fill", "rgba(241, 245, 249, 0.3)")
    .attr("stroke", "rgba(203, 213, 225, 0.2)")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "4,4");

  // Draw nodes
  const nodeEnter = g.selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

  // Render each member
  nodeEnter.each(function(d: any) {
    const nodeGroup = d3.select(this);
    
    if (d.data.type === 'couple') {
      // Render couple - two members side by side
      const spouseOffset = nodeWidth / 2 + 20;
      renderMemberNode(nodeGroup, d.data.member, -spouseOffset / 2, {
        nodeWidth, nodeHeight, isMobile, searchTerm, onSelectMember, onAddRelative
      });
      if (d.data.spouse) {
        renderMemberNode(nodeGroup, d.data.spouse, spouseOffset / 2, {
          nodeWidth, nodeHeight, isMobile, searchTerm, onSelectMember, onAddRelative
        });
      }
    } else {
      // Render single member
      renderMemberNode(nodeGroup, d.data.member, 0, {
        nodeWidth, nodeHeight, isMobile, searchTerm, onSelectMember, onAddRelative
      });
    }
  });
}

/**
 * Render a single member node
 */
function renderMemberNode(
  parent: d3.Selection<SVGGElement, unknown, null, undefined>,
  member: Member | undefined,
  offsetX: number,
  config: {
    nodeWidth: number;
    nodeHeight: number;
    isMobile: boolean;
    searchTerm: string;
    onSelectMember: (member: Member) => void;
    onAddRelative?: (member: Member) => void;
  }
) {
  if (!member) return;
  
  const { nodeWidth, nodeHeight, isMobile, searchTerm, onSelectMember, onAddRelative } = config;
  
  const card = parent.append("g")
    .attr("transform", `translate(${offsetX}, 0)`)
    .style("cursor", "pointer")
    .on("click", (event: MouseEvent) => {
      event.stopPropagation();
      onSelectMember(member);
    });

  const isMatch = searchTerm && member.name.toLowerCase().includes(searchTerm.toLowerCase());
  const accentColor = member.gender === 'male' ? "#3b82f6" : member.gender === 'female' ? "#ec4899" : "#94a3b8";
  const bgColor = member.gender === 'male' ? "#eff6ff" : member.gender === 'female' ? "#fdf2f8" : "#f8fafc";
  const isMantu = member.isAdoptedChild || !!member.externalFamilyId || !!member.externalSpouseName;

  // Card background
  card.append("rect")
    .attr("x", -nodeWidth / 2)
    .attr("y", -nodeHeight / 2)
    .attr("width", nodeWidth)
    .attr("height", nodeHeight)
    .attr("rx", isMobile ? 12 : 16)
    .attr("fill", isMantu ? "#fffbeb" : "white")
    .attr("stroke", isMatch ? "#3b82f6" : isMantu ? "#f59e0b" : "#f1f5f9")
    .attr("stroke-width", isMatch ? 3 : isMantu ? 2 : 1)
    .style("filter", "drop-shadow(0 10px 15px -3px rgb(0 0 0 / 0.05))");

  // Mantu badge
  if (isMantu) {
    card.append("circle")
      .attr("cx", nodeWidth / 2 - 12)
      .attr("cy", -nodeHeight / 2 + 12)
      .attr("r", 10)
      .attr("fill", "#f59e0b");
    card.append("text")
      .attr("x", nodeWidth / 2 - 12)
      .attr("y", -nodeHeight / 2 + 12)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text("M");
  }

  // Top accent bar
  card.append("path")
    .attr("d", `M${-nodeWidth/2 + 12},${-nodeHeight/2} h${nodeWidth - 24} a4,4 0 0 1 4,4 v2 h${-nodeWidth} v-2 a4,4 0 0 1 4,-4`)
    .attr("fill", accentColor)
    .attr("opacity", 0.8);

  // Avatar
  const avatarSize = isMobile ? 40 : 52;
  const avatarX = -nodeWidth / 2 + (isMobile ? 28 : 35);
  
  card.append("circle")
    .attr("cx", avatarX)
    .attr("cy", 0)
    .attr("r", avatarSize / 2 + 2)
    .attr("fill", "white")
    .attr("stroke", bgColor)
    .attr("stroke-width", 2);

  if (member.photoUrl) {
    const clipId = `clip-${member.id.replace(/[^a-zA-Z0-9]/g, '')}`;
    const defs = card.append("defs");
    defs.append("clipPath")
      .attr("id", clipId)
      .append("circle")
      .attr("cx", avatarX)
      .attr("cy", 0)
      .attr("r", avatarSize / 2);

    card.append("image")
      .attr("xlink:href", member.photoUrl)
      .attr("crossorigin", "anonymous")
      .attr("x", avatarX - avatarSize / 2)
      .attr("y", -avatarSize / 2)
      .attr("width", avatarSize)
      .attr("height", avatarSize)
      .attr("clip-path", `url(#${clipId})`)
      .attr("preserveAspectRatio", "xMidYMid slice");
  } else {
    card.append("circle")
      .attr("cx", avatarX)
      .attr("cy", 0)
      .attr("r", avatarSize / 2)
      .attr("fill", bgColor);
    card.append("text")
      .attr("x", avatarX)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("class", `${isMobile ? 'text-[14px]' : 'text-base'} font-black`)
      .attr("fill", accentColor)
      .text(member.name.charAt(0).toUpperCase());
  }

  // Name
  const textX = -nodeWidth / 2 + (isMobile ? 58 : 75);
  const maxChars = isMobile ? 12 : 18;
  const name = member.name.length > maxChars ? member.name.substring(0, maxChars - 2) + "..." : member.name;
  
  card.append("text")
    .attr("x", textX)
    .attr("y", isMobile ? -10 : -14)
    .attr("class", `${isMobile ? 'text-[12px]' : 'text-sm'} font-black fill-slate-900`)
    .text(name);

  // Birth year
  const birthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : "?";
  card.append("text")
    .attr("x", textX)
    .attr("y", isMobile ? 8 : 10)
    .attr("class", `${isMobile ? 'text-[9px]' : 'text-[11px]'} font-medium fill-slate-500`)
    .text(birthYear.toString());

  // Quick add button
  if (onAddRelative) {
    const addBtn = card.append("g")
      .attr("transform", `translate(${nodeWidth/2 - 14}, ${-nodeHeight/2 + 14})`)
      .style("opacity", isMobile ? 1 : 0)
      .on("click", (event: MouseEvent) => {
        event.stopPropagation();
        onAddRelative(member);
      });

    addBtn.append("circle")
      .attr("r", 10)
      .attr("fill", "white")
      .attr("stroke", "#f1f5f9")
      .attr("stroke-width", 1);

    addBtn.append("path")
      .attr("d", "M-3 0 h6 M0 -3 v6")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round");
  }
}

export default {
  renderTree
};
