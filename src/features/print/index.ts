/**
 * Print Feature Exports
 * Orchestrates utilities and service for convenient importing
 */

// Re-export utilities (pure functions)
export { 
  prepareSvgForExport, 
  serializeSvg, 
  isLandscapeOrientation 
} from './printUtils';

// Re-export service (UI orchestration with side effects)
export { handlePrint, handleDownload } from './PrintService';
