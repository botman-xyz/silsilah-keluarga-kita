/**
 * Tree Nodes Component
 * Renders individual member nodes in the family tree
 */

import * as d3 from 'd3';

interface MemberNode {
  x: number;
  y: number;
  data: {
    id: string;
    name: string;
    gender?: string;
    photoUrl?: string;
    birthDate?: string;
    isPrimary?: boolean;
    type?: string;
  };
}

interface TreeNodesProps {
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  nodes: MemberNode[];
  nodeWidth: number;
  nodeHeight: number;
  onNodeClick?: (node: MemberNode) => void;
  onNodeContextMenu?: (node: MemberNode, event: MouseEvent) => void;
}

export const renderNodes = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: MemberNode[],
  nodeWidth: number,
  nodeHeight: number,
  onNodeClick?: (node: MemberNode) => void,
  onNodeContextMenu?: (node: MemberNode, event: MouseEvent) => void
): void => {
  const nodeGroup = g.selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", (d: MemberNode) => `translate(${d.x - nodeWidth / 2}, ${d.y - nodeHeight / 2})`)
    .style("cursor", "pointer")
    .style("opacity", 0);

  // Card background with performance optimizations
  nodeGroup.append("rect")
    .attr("width", nodeWidth)
    .attr("height", nodeHeight)
    .attr("rx", 12)
    .attr("fill", "white")
    .attr("stroke", (d: MemberNode) => d.data.isPrimary ? "#3b82f6" : "#e2e8f0")
    .attr("stroke-width", (d: MemberNode) => d.data.isPrimary ? 3 : 1)
    .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
    .style("transition", "all 0.2s ease")
    .style("shape-rendering", "geometricPrecision"); // Better rendering quality

  // Avatar circle
  nodeGroup.append("circle")
    .attr("cx", nodeWidth / 2)
    .attr("cy", nodeHeight / 2 - 8)
    .attr("r", 24)
    .attr("fill", (d: MemberNode) => d.data.gender === 'male' ? '#dbeafe' : '#fce7f3');

  // Avatar initials
  nodeGroup.append("text")
    .attr("x", nodeWidth / 2)
    .attr("y", nodeHeight / 2 - 4)
    .attr("text-anchor", "middle")
    .attr("fill", (d: MemberNode) => d.data.gender === 'male' ? '#1e40af' : '#9d174d')
    .attr("font-size", "14px")
    .attr("font-weight", "600")
    .text((d: MemberNode) => {
      const name = d.data.name || '';
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
        const first = parts[0][0]?.toUpperCase() || '';
        const last = parts[parts.length - 1][0]?.toUpperCase() || '';
        return first + last;
      }
      return name.substring(0, 2).toUpperCase() || '??';
    });

  // Name
  nodeGroup.append("text")
    .attr("x", nodeWidth / 2)
    .attr("y", nodeHeight - 8)
    .attr("text-anchor", "middle")
    .attr("fill", "#1e293b")
    .attr("font-size", "11px")
    .attr("font-weight", "500")
    .text((d: MemberNode) => {
      const name = d.data.name || '';
      return name.length > 18 ? name.substring(0, 16) + '...' : name;
    });

  // Interactions
  nodeGroup
    .on("click", (event: MouseEvent, d: MemberNode) => {
      event.stopPropagation();
      if (onNodeClick) onNodeClick(d);
    })
    .on("contextmenu", (event: MouseEvent, d: MemberNode) => {
      event.preventDefault();
      if (onNodeContextMenu) onNodeContextMenu(d, event);
    })
    .on("mouseenter", function() {
      d3.select(this).select("rect")
        .attr("stroke", "#3b82f6")
        .attr("stroke-width", 2);
    })
    .on("mouseleave", function(event, d: MemberNode) {
      d3.select(this).select("rect")
        .attr("stroke", d.data.isPrimary ? "#3b82f6" : "#e2e8f0")
        .attr("stroke-width", d.data.isPrimary ? 3 : 1);
    });

  // Fade in animation
  nodeGroup.transition()
    .duration(500)
    .delay((d: MemberNode, i: number) => i * 50)
    .style("opacity", 1);
};

export default { renderNodes };