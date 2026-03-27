/**
 * Print Feature Exports
 * Orchestrates utilities, templates, and service for convenient importing
 */

// Re-export utilities (pure functions)
export { 
  prepareSvgForExport, 
  serializeSvg, 
  isLandscapeOrientation 
} from './printUtils';

// Re-export templates (pure functions)
export { 
  generatePrintTemplate,
  openPrintWindow,
  createDownloadLink,
  svgToBlob
} from './printTemplates';

// Re-export service (UI orchestration with side effects)
export { handlePrint, handleDownload } from './PrintService';
