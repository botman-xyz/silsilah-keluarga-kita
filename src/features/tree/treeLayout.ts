// Tree Layout Configuration
// Separated for better maintainability

export interface TreeLayoutConfig {
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Get layout configuration based on screen size
 */
export function getLayoutConfig(width: number, height: number): TreeLayoutConfig {
  const isMobile = width < 768;
  
  return {
    nodeWidth: isMobile ? 140 : 200,
    nodeHeight: isMobile ? 70 : 90,
    horizontalSpacing: isMobile ? 40 : 80,
    verticalSpacing: isMobile ? 100 : 140
  };
}

/**
 * Calculate scale constraints for auto-fit
 */
export function getScaleConstraints(width: number, height: number): { min: number; max: number } {
  const isMobile = width < 768;
  return {
    min: isMobile ? 0.4 : 0.2,
    max: isMobile ? 1.2 : 1.1
  };
}

/**
 * Calculate optimal scale to fit tree in view
 */
export function calculateFitScale(
  bounds: { x: number; y: number; width: number; height: number },
  containerWidth: number,
  containerHeight: number
): number {
  const isMobile = containerWidth < 768;
  const midX = bounds.x + bounds.width / 2;
  const midY = bounds.y + bounds.height / 2;
  
  let scale = 0.9 / Math.max(bounds.width / containerWidth, bounds.height / containerHeight);
  
  const constraints = getScaleConstraints(containerWidth, containerHeight);
  scale = Math.max(constraints.min, Math.min(scale, constraints.max));
  
  return scale;
}