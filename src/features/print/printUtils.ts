/**
 * Print Utilities
 * Pure functions for SVG preparation (no external dependencies)
 */

interface PrepareSvgResult {
  clone: SVGSVGElement;
  width: number;
  height: number;
}

/**
 * Gets the actual content bounds of an SVG element
 */
const getSvgBounds = (g: SVGSVGElement | null): { x: number; y: number; width: number; height: number } | null => {
  if (!g) return null;
  return g.getBBox();
};

/**
 * Applies CSS styles to SVG for standalone rendering
 */
const applySvgStyles = (clone: SVGSVGElement): void => {
  const style = document.createElement('style');
  style.textContent = `
    .fill-slate-900 { fill: #0f172a; }
    .fill-slate-500 { fill: #64748b; }
    .fill-slate-400 { fill: #94a3b8; }
    .fill-slate-300 { fill: #cbd5e1; }
    .fill-blue-500 { fill: #3b82f6; }
    .fill-blue-600 { fill: #2563eb; }
    .fill-blue-700 { fill: #1d4ed8; }
    .fill-pink-500 { fill: #ec4899; }
    .fill-pink-600 { fill: #db2777; }
    .fill-pink-700 { fill: #be185d; }
    .font-bold { font-weight: bold; }
    .font-black { font-weight: 900; }
    .font-medium { font-weight: 500; }
    .italic { font-style: italic; }
    .uppercase { text-transform: uppercase; }
    .text-[8px] { font-size: 8px; }
    .text-[9px] { font-size: 9px; }
    .text-[10px] { font-size: 10px; }
    .text-[11px] { font-size: 11px; }
    .text-[12px] { font-size: 12px; }
    .text-[14px] { font-size: 14px; }
    .text-xs { font-size: 12px; }
    .text-sm { font-size: 14px; }
    .text-base { font-size: 16px; }
    .tracking-tight { letter-spacing: -0.025em; }
    .tracking-[0.2em] { letter-spacing: 0.2em; }
    text { font-family: 'Inter', -apple-system, sans-serif; }
  `;
  clone.insertBefore(style, clone.firstChild);
};

/**
 * Converts images in SVG to base64 to avoid CORS issues
 */
const convertImagesToBase64 = async (clone: SVGSVGElement): Promise<void> => {
  const images = clone.querySelectorAll('image');
  const imagePromises = Array.from(images).map(async (img) => {
    const href = img.getAttribute('xlink:href') || img.getAttribute('href');
    if (href && !href.startsWith('data:')) {
      try {
        const response = await fetch(href);
        const blob = await response.blob();
        return new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            img.setAttribute('xlink:href', reader.result as string);
            img.setAttribute('href', reader.result as string);
            resolve();
          };
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn('Failed to convert image to base64:', href);
      }
    }
    return Promise.resolve();
  });
  await Promise.all(imagePromises);
};

/**
 * Prepares an SVG element for export by:
 * 1. Getting the actual content bounds
 * 2. Cloning the SVG to avoid modifying the original
 * 3. Converting external images to base64
 * 4. Adding necessary styles
 */
export async function prepareSvgForExport(svg: SVGSVGElement): Promise<PrepareSvgResult | null> {
  const g = svg.querySelector('g');
  if (!g) return null;
  
  const bounds = g.getBBox();
  if (!bounds) return null;
  
  const padding = 20;
  const width = bounds.width + padding * 2;
  const height = bounds.height + padding * 2;
  
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const cloneG = clone.querySelector('g');
  if (cloneG) {
    cloneG.removeAttribute('transform');
  }

  clone.setAttribute('width', width.toString());
  clone.setAttribute('height', height.toString());
  clone.setAttribute('viewBox', `${bounds.x - padding} ${bounds.y - padding} ${width} ${height}`);
  
  await convertImagesToBase64(clone);
  applySvgStyles(clone);
  
  return { clone, width, height };
}

/**
 * Converts SVG to string data
 */
export const serializeSvg = (clone: SVGSVGElement): string => {
  return new XMLSerializer().serializeToString(clone);
};

/**
 * Checks if SVG is landscape orientation
 */
export const isLandscapeOrientation = (width: number, height: number): boolean => {
  return width > height;
};

export default {
  prepareSvgForExport,
  serializeSvg,
  isLandscapeOrientation
};