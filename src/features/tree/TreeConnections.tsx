/**
 * Tree Connections Component
 * Renders connection lines between family members
 * Improved visibility and styling
 */

import * as d3 from 'd3';

interface LinkData {
  source: { x: number; y: number; data: { type: string } };
  target: { x: number; y: number };
}

interface TreeConnectionsProps {
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  links: d3.HierarchyPointLink<any>[];
  nodeHeight: number;
}

export const renderConnections = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  links: d3.HierarchyPointLink<any>[],
  nodeHeight: number
): void => {
  const linkGenerator = d3.linkVertical<any, any>()
    .x((d: any) => d.x)
    .y((d: any) => d.y);

  g.selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", (d: any) => {
      // Different colors for different connection types
      const sourceType = d.source.data.type;
      const targetType = d.target.data.type;
      
      // Couple to child connections
      if (sourceType === 'couple' && targetType === 'individual') {
        return "#94a3b8"; // slate-400
      }
      // Couple to couple (unlikely but just in case)
      if (sourceType === 'couple' && targetType === 'couple') {
        return "#64748b"; // slate-500
      }
      // Individual to anything
      return "#cbd5e1"; // slate-300
    })
    .attr("stroke-width", 2.5)
    .attr("stroke-dasharray", (d: any) => d.target.data.type === 'couple' ? "0" : "5,3")
    .attr("d", (d: any) => {
      const sourceX = d.source.x;
      const sourceY = d.source.y + nodeHeight / 2;
      const targetX = d.target.x;
      const targetY = d.target.y - nodeHeight / 2;
      
      // Custom curved path for cleaner look
      const midY = (sourceY + targetY) / 2;
      return `M${sourceX},${sourceY} 
              C${sourceX},${midY} ${targetX},${midY} ${targetX},${targetY}`;
    })
    .style("transition", "stroke 0.3s ease, stroke-width 0.3s ease")
    .style("opacity", 0.9)
    .on("mouseenter", function() { 
      d3.select(this).attr("stroke", "#3b82f6").attr("stroke-width", 4); 
    })
    .on("mouseleave", function() { 
      d3.select(this).attr("stroke", "#94a3b8").attr("stroke-width", 2.5); 
    });
};

export default { renderConnections };