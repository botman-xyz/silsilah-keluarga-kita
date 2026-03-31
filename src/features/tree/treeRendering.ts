/**
 * Tree Rendering - Main Entry Point
 * Provides a clean API for rendering the family tree
 * This is the main interface that FamilyTree.tsx should use
 */

import * as d3 from 'd3';
import { Member } from '../../domain/entities';
import { TreeNode, buildTreeHierarchy } from './treeBuilder';
import { getLayoutConfig, calculateFitScale } from './treeLayout';

export interface RenderConfig {
  width: number;
  height: number;
  members: Member[];
  searchTerm: string;
  onSelectMember: (member: Member) => void;
  onAddRelative?: (member: Member) => void;
  isLargeTree: boolean;
}

/**
 * Main render function - renders the entire tree
 */
export function renderTree(
  svgElement: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  config: RenderConfig,
  memberPositionsRef: React.MutableRefObject<Map<string, { x: number; y: number }>>
): d3.ZoomBehavior<SVGSVGElement, unknown> | null {
  const { width, height, members, searchTerm, onSelectMember, onAddRelative } = config;
  const layout = getLayoutConfig(width, height);
  const isMobile = width < 768;
  
  // Calculate dynamic canvas size based on estimated tree dimensions
  // For large trees, use larger canvas
  const estimatedNodes = members.length;
  const estimatedWidth = Math.max(3000, estimatedNodes * 200); // Minimum 3000, scale with nodes
  const estimatedHeight = Math.max(2000, estimatedNodes * 100); // Minimum 2000, scale with nodes
  const canvasWidth = Math.min(estimatedWidth, 8000); // Cap at 8000 to prevent excessive memory use
  const canvasHeight = Math.min(estimatedHeight, 6000); // Cap at 6000
  
  // Clear previous content
  svgElement.selectAll("*").remove();
  
  // Setup SVG with larger canvas
  const svg = svgElement
    .attr("width", canvasWidth)
    .attr("height", canvasHeight)
    .attr("viewBox", `0 0 ${canvasWidth} ${canvasHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet");
  
  const g = svg.append("g");
  
  // Render grid
  renderGrid(g, isMobile);
  
  // Build hierarchy
  const treeData = buildTreeHierarchy(members);
  const hierarchy = d3.hierarchy(treeData);
  
  // Layout
  const treeLayout = d3.tree<TreeNode>()
    .nodeSize([layout.nodeWidth * 2 + layout.horizontalSpacing, layout.nodeHeight + layout.verticalSpacing]);
  treeLayout(hierarchy);
  
  // Filter nodes
  const nodes = hierarchy.descendants().filter(d => !d.data.isVirtual) as d3.HierarchyPointNode<TreeNode>[];
  const links = hierarchy.links().filter(l => !l.source.data.isVirtual && !l.target.data.isVirtual) as d3.HierarchyPointLink<TreeNode>[];
  
  // Store positions
  nodes.forEach(d => {
    if (d.data.member?.id) {
      memberPositionsRef.current.set(d.data.member.id, { x: d.x, y: d.y });
    }
  });
  
  // Render generation backgrounds
  renderGenBackgrounds(g, nodes, layout.nodeHeight, isMobile);
  
  // Render connections
  renderLinks(g, links, layout.nodeWidth, layout.nodeHeight);
  
  // Render nodes
  renderNodes(g, nodes, {
    nodeWidth: layout.nodeWidth,
    nodeHeight: layout.nodeHeight,
    isMobile,
    searchTerm,
    onSelectMember,
    onAddRelative
  });
  
  // Setup zoom
  const zoom = setupZoom(svg, g);
  
  return zoom;
}

/**
 * Render grid background
 */
function renderGrid(g: d3.Selection<SVGGElement, unknown, null, undefined>, isMobile: boolean) {
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
function renderGenBackgrounds(
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
function renderLinks(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  links: d3.HierarchyPointLink<TreeNode>[],
  nodeWidth: number,
  nodeHeight: number
) {
  const linkGen = d3.linkVertical<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
    .x((d: any) => d.x)
    .y((d: any) => d.y);

  g.selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", (d: any) => {
      const s = d.source.data.type, t = d.target.data.type;
      if (s === 'couple' && t === 'individual') return "#94a3b8";
      if (s === 'couple' && t === 'couple') return "#64748b";
      return "#cbd5e1";
    })
    .attr("stroke-width", 2.5)
    .attr("stroke-dasharray", (d: any) => d.target.data.type === 'couple' ? "0" : "5,3")
    .attr("d", (d: any) => {
      const sx = d.source.x, sy = d.source.y + nodeHeight/2;
      const tx = d.target.x, ty = d.target.y - nodeHeight/2;
      return `M${sx},${sy} C${sx},${(sy+ty)/2} ${tx},${(sy+ty)/2} ${tx},${ty}`;
    })
    .style("opacity", 0.9);
}

/**
 * Render all tree nodes
 */
function renderNodes(
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
  // Family unit backgrounds
  const families = nodes.filter(d => d.children?.length);
  g.selectAll(".family-unit-bg")
    .data(families)
    .enter()
    .insert("rect", ":first-child")
    .attr("x", (d: any) => Math.min(d.x, ...d.children.map((c: any) => c.x)) - (d.data.type === 'couple' ? config.nodeWidth : config.nodeWidth/2) - 15)
    .attr("y", (d: any) => d.y - config.nodeHeight/2 - 15)
    .attr("width", (d: any) => {
      const childX = d.children.map((c: any) => c.x);
      const minX = Math.min(d.x, ...childX) - (d.data.type === 'couple' ? config.nodeWidth : config.nodeWidth/2) - 15;
      const maxX = Math.max(d.x, ...childX) + (d.data.type === 'couple' ? config.nodeWidth : config.nodeWidth/2) + 15;
      return maxX - minX;
    })
    .attr("height", (d: any) => Math.max(...d.children.map((c: any) => c.y)) + config.nodeHeight/2 + 15 - (d.y - config.nodeHeight/2 - 15))
    .attr("rx", 20)
    .attr("fill", "rgba(241, 245, 249, 0.3)")
    .attr("stroke", "rgba(203, 213, 225, 0.2)");

  // Member nodes
  const nodeEnter = g.selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

  nodeEnter.each(function(d: any) {
    const ng = d3.select(this);
    if (d.data.type === 'couple') {
      renderMemberCard(ng, d.data.member, -config.nodeWidth/2 - 20, config);
      if (d.data.spouse) renderMemberCard(ng, d.data.spouse, config.nodeWidth/2 + 20, config);
    } else {
      renderMemberCard(ng, d.data.member, 0, config);
    }
  });
}

/**
 * Render a single member card
 */
function renderMemberCard(
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
  const isMatch = searchTerm && member.name.toLowerCase().includes(searchTerm.toLowerCase());
  const accent = member.gender === 'male' ? "#3b82f6" : member.gender === 'female' ? "#ec4899" : "#94a3b8";
  const bg = member.gender === 'male' ? "#eff6ff" : member.gender === 'female' ? "#fdf2f8" : "#f8fafc";
  const isMantu = member.isAdoptedChild || !!member.externalFamilyId || !!member.externalSpouseName;
  
  const card = parent.append("g")
    .attr("transform", `translate(${offsetX}, 0)`)
    .style("cursor", "pointer")
    .on("click", (e: MouseEvent) => { e.stopPropagation(); onSelectMember(member); });

  // Background
  card.append("rect")
    .attr("x", -nodeWidth/2).attr("y", -nodeHeight/2)
    .attr("width", nodeWidth).attr("height", nodeHeight)
    .attr("rx", isMobile ? 12 : 16)
    .attr("fill", isMantu ? "#fffbeb" : "white")
    .attr("stroke", isMatch ? "#3b82f6" : isMantu ? "#f59e0b" : "#f1f5f9")
    .attr("stroke-width", isMatch ? 3 : isMantu ? 2 : 1)
    .style("filter", "drop-shadow(0 10px 15px -3px rgb(0 0 0 / 0.05))");

  // Mantu badge
  if (isMantu) {
    card.append("circle").attr("cx", nodeWidth/2 - 12).attr("cy", -nodeHeight/2 + 12).attr("r", 10).attr("fill", "#f59e0b");
    card.append("text").attr("x", nodeWidth/2 - 12).attr("y", -nodeHeight/2 + 12).attr("dy", "0.35em")
      .attr("text-anchor", "middle").attr("fill", "white").attr("font-size", "10px").attr("font-weight", "bold").text("M");
  }

  // Accent bar
  card.append("path")
    .attr("d", `M${-nodeWidth/2 + 12},${-nodeHeight/2} h${nodeWidth - 24} a4,4 0 0 1 4,4 v2 h${-nodeWidth} v-2 a4,4 0 0 1 4,-4`)
    .attr("fill", accent).attr("opacity", 0.8);

  // Avatar
  const avatarSize = isMobile ? 40 : 52;
  const avatarX = -nodeWidth/2 + (isMobile ? 28 : 35);
  card.append("circle").attr("cx", avatarX).attr("cy", 0).attr("r", avatarSize/2 + 2).attr("fill", "white").attr("stroke", bg).attr("stroke-width", 2);

  if (member.photoUrl) {
    const clipId = `clip-${member.id.replace(/[^a-zA-Z0-9]/g, '')}`;
    card.append("defs").append("clipPath").attr("id", clipId).append("circle").attr("cx", avatarX).attr("cy", 0).attr("r", avatarSize/2);
    card.append("image").attr("xlink:href", member.photoUrl).attr("crossorigin", "anonymous")
      .attr("x", avatarX - avatarSize/2).attr("y", -avatarSize/2).attr("width", avatarSize).attr("height", avatarSize)
      .attr("clip-path", `url(#${clipId})`);
  } else {
    card.append("circle").attr("cx", avatarX).attr("cy", 0).attr("r", avatarSize/2).attr("fill", bg);
    card.append("text").attr("x", avatarX).attr("y", 0).attr("dy", "0.35em").attr("text-anchor", "middle")
      .attr("class", `${isMobile ? 'text-[14px]' : 'text-base'} font-black`).attr("fill", accent).text(member.name.charAt(0).toUpperCase());
  }

  // Name
  const textX = -nodeWidth/2 + (isMobile ? 58 : 75);
  const name = member.name.length > (isMobile ? 12 : 18) ? member.name.substring(0, (isMobile ? 12 : 18) - 2) + "..." : member.name;
  card.append("text").attr("x", textX).attr("y", isMobile ? -10 : -14)
    .attr("class", `${isMobile ? 'text-[12px]' : 'text-sm'} font-black fill-slate-900`).text(name);

  // Birth year
  card.append("text").attr("x", textX).attr("y", isMobile ? 8 : 10)
    .attr("class", `${isMobile ? 'text-[9px]' : 'text-[11px]'} font-medium fill-slate-500`)
    .text(member.birthDate ? new Date(member.birthDate).getFullYear() : "?");

  // Quick add
  if (onAddRelative) {
    const btn = card.append("g").attr("transform", `translate(${nodeWidth/2 - 14}, ${-nodeHeight/2 + 14})`)
      .style("opacity", isMobile ? 1 : 0)
      .on("click", (e: MouseEvent) => { e.stopPropagation(); onAddRelative(member); });
    btn.append("circle").attr("r", 10).attr("fill", "white").attr("stroke", "#f1f5f9");
    btn.append("path").attr("d", "M-3 0 h6 M0 -3 v6").attr("stroke", "#3b82f6").attr("stroke-width", 2).attr("stroke-linecap", "round");
  }
}

/**
 * Setup zoom behavior
 */
function setupZoom(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, g: d3.Selection<SVGGElement, unknown, null, undefined>) {
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.02, 8])
    .on("zoom", (event) => g.attr("transform", event.transform));
  
  svg.call(zoom);
  return zoom;
}

/**
 * Fit tree to view
 */
export function fitTreeToView(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  zoom: d3.ZoomBehavior<SVGSVGElement, unknown>,
  nodes: any[],
  width: number,
  height: number
) {
  if (nodes.length === 0) return;
  
  const xExtent = d3.extent(nodes, d => d.x);
  const yExtent = d3.extent(nodes, d => d.y);
  
  if (!xExtent[0] || !xExtent[1] || !yExtent[0] || !yExtent[1]) return;
  
  const bounds = {
    x: xExtent[0], y: yExtent[0],
    width: xExtent[1] - xExtent[0],
    height: yExtent[1] - yExtent[0]
  };
  
  const scale = calculateFitScale(bounds, width, height);
  const midX = bounds.x + bounds.width / 2;
  const midY = bounds.y + bounds.height / 2;
  const translate = [width/2 - scale * midX, height/2 - scale * midY];
  
  svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
}

export default { renderTree, fitTreeToView };
