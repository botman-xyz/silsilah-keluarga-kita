// Feature exports for Export functionality
// Orchestrates exports from different layers:

// UI-specific exports (CSV, Text reports) - Presentation layer
export { exportMembersToCSV, exportStatsToText } from './ExportService';

// JSON import/export from Infrastructure layer (Firebase implementation)
import { firebaseExportService } from '../../infrastructure/services/ExportService';

export { firebaseExportService as exportService };
export const exportFamilyToJSON = firebaseExportService.exportFamilyToJSON;
export const exportAllFamiliesToJSON = firebaseExportService.exportAllFamiliesToJSON;
export const importFamilyFromJSON = firebaseExportService.importFamilyFromJSON;
export const triggerImportFileInput = firebaseExportService.triggerImportFileInput;
export const readJSONFile = firebaseExportService.readJSONFile;
export const handleImport = firebaseExportService.handleImport;
