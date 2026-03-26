// Wrapper for data import/export functionality
// The actual implementation is in src/features/export/ExportService.tsx
import { 
  exportFamilyToJSON, 
  exportAllFamiliesToJSON, 
  importFamilyFromJSON 
} from '../features/export/ExportService';
import { Family, Member, UserProfile } from '../types';
import { toast } from 'sonner';

// Export all family data
export function exportAllData(families: Family[], allMembers: Member[]): void {
  exportAllFamiliesToJSON(families, allMembers);
  toast.success('Data berhasil diekspor!');
}

// Export specific family
export function exportFamilyData(family: Family, members: Member[]): void {
  exportFamilyToJSON(family, members);
}

// Handle import with callback - accepts UserProfile from the app
export async function handleImportJSON(
  user: UserProfile | null, 
  onComplete?: () => void
): Promise<void> {
  if (!user) {
    toast.error('Silakan login terlebih dahulu.');
    return;
  }

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          await importFamilyFromJSON(data, user.uid);
          toast.success('Data berhasil diimpor!');
          onComplete?.();
        } catch (error) {
          toast.error('Format file tidak valid.');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error('Gagal membaca file.');
    }
  };
  input.click();
}

// Delete all user data - accepts UserProfile
export async function deleteAllData(
  user: UserProfile | null, 
  families: Family[], 
  onComplete?: () => void
): Promise<void> {
  if (!user) return;
  
  // This would need to be implemented with Firebase admin or cloud functions
  // For now, show a message
  toast.error('Fitur hapus semua data memerlukan fungsi backend. Silakan hapus keluarga satu per satu.');
}
