/**
 * Tree Background Component
 * Renders the grid background for the family tree
 */

import * as d3 from 'd3';

interface TreeBackgroundProps {
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  gridSize?: number;
  gridLimit?: number;
}

export const renderTreeBackground = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  gridSize: number = 40,
  gridLimit: number = 5000
): void => {
  const gridGroup = g.append("g").attr("class", "grid-bg");
  
  for (let i = -gridLimit; i <= gridLimit; i += gridSize) {
    // Vertical lines
    gridGroup.append("line")
      .attr("x1", i).attr("y1", -gridLimit)
      .attr("x2", i).attr("y2", gridLimit)
      .attr("stroke", "#f1f5f9").attr("stroke-width", 1);
    
    // Horizontal lines
    gridGroup.append("line")
      .attr("x1", -gridLimit).attr("y1", i)
      .attr("x2", gridLimit).attr("y2", i)
      .attr("stroke", "#f1f5f9").attr("stroke-width", 1);
  }
};

export default { renderTreeBackground };