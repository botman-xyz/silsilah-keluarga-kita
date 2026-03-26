import { Family, Member } from '../../domain/entities';

export interface ExportData {
  family?: Family;
  families?: Family[];
  members?: Member[];
  exportedAt?: string;
  version?: string;
}

/**
 * Use case for exporting/importing family data
 * This is pure business logic - no infrastructure dependencies
 */
export class ExportService {
  /**
   * Export family data to JSON format
   */
  exportFamilyToJSON(family: Family, members: Member[], filename?: string): void {
    const data: ExportData = {
      family,
      members,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename || `${family.name.replace(/[^a-z0-9]/gi, '-')}-data.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export all families to JSON format
   */
  exportAllFamiliesToJSON(families: Family[], allMembers: Member[]): void {
    const data: ExportData = {
      families,
      members: allMembers,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `semua-keluarga-${new Date().toISOString().split('T')[0]}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Parse import data and return families/members to import
   */
  parseImportData(data: ExportData): { families: Family[]; members: Member[] } {
    // Handle both single family export and all families export
    const families = data.family ? [data.family] : (data.families || []);
    const members = data.members || [];

    if (families.length === 0) {
      throw new Error('Format file tidak valid: Tidak ada data keluarga ditemukan.');
    }

    return { families, members };
  }

  /**
   * Create import mapping for ID translation
   */
  createIdMapping(members: Member[]): Map<string, string> {
    const idMap = new Map<string, string>();
    members.forEach(m => idMap.set(m.id, m.id));
    return idMap;
  }

  /**
   * Trigger file input for importing JSON
   */
  triggerImportFileInput(onFileSelected: (file: File) => void): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        onFileSelected(file);
      }
    };
    input.click();
  }

  /**
   * Read JSON file content
   */
  readJSONFile<T>(file: File): Promise<T> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          resolve(data);
        } catch (error) {
          reject(new Error('Gagal membaca file JSON.'));
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file.'));
      reader.readAsText(file);
    });
  }
}
