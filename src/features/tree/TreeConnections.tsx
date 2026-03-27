/**
 * Tree Connections Component
 * Renders connection lines between family members
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
    .attr("stroke", "#e2e8f0")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", (d: any) => d.target.data.type === 'couple' ? "0" : "4,4")
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
    .style("transition", "stroke 0.3s ease")
    .on("mouseenter", function() { d3.select(this).attr("stroke", "#3b82f6").attr("stroke-width", 3); })
    .on("mouseleave", function() { d3.select(this).attr("stroke", "#e2e8f0").attr("stroke-width", 2); });
};

export default { renderConnections };