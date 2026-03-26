import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Family, Member } from '../../domain/entities';
import { ExportService as AppExportService } from '../../application/services';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

/**
 * Infrastructure-level export service that handles:
 * - Firebase-specific import logic
 * - UI interactions (toast notifications)
 * - File system interactions
 */
class FirebaseExportService {
  private exportService = new AppExportService();

  /**
   * Export family data to JSON file
   */
  exportFamilyToJSON(family: Family, members: Member[], filename?: string): void {
    this.exportService.exportFamilyToJSON(family, members, filename);
  }

  /**
   * Export all families to JSON file
   */
  exportAllFamiliesToJSON(families: Family[], allMembers: Member[]): void {
    this.exportService.exportAllFamiliesToJSON(families, allMembers);
  }

  /**
   * Import family data from JSON file (Firebase-specific)
   */
  async importFamilyFromJSON(
    data: { family?: Family; families?: Family[]; members?: Member[] },
    userUid: string | undefined
  ): Promise<{ importedFamilies: number; importedMembers: number }> {
    const { families, members } = this.exportService.parseImportData(data);

    if (families.length === 0) {
      throw new Error('Format file tidak valid: Tidak ada data keluarga ditemukan.');
    }

    let importedFamilies = 0;
    let importedMembers = 0;

    for (const famData of families) {
      // Create new family
      const familyRef = await addDoc(collection(db, 'families'), {
        name: `${famData.name} (Import)`,
        ownerId: userUid,
        collaborators: [],
        createdAt: Timestamp.now()
      });

      // Filter members for this family
      const familyMembers = (members || []).filter((m) => m.familyId === famData.id || !m.familyId);

      // Map old IDs to new IDs
      const idMap: { [key: string]: string } = {};
      
      // First pass: Create members and get new IDs
      const createPromises = familyMembers.map(async (m) => {
        const { id, ...memberData } = m;
        delete memberData.familyId;
        
        const newMemberRef = await addDoc(collection(db, 'families', familyRef.id, 'people'), {
          ...memberData,
          familyId: familyRef.id,
          updatedAt: new Date().toISOString()
        });
        idMap[id] = newMemberRef.id;
        return { oldId: id, newId: newMemberRef.id };
      });

      await Promise.all(createPromises);

      // Second pass: Update relationships with new IDs
      const updatePromises = familyMembers.map(async (m) => {
        const newId = idMap[m.id];
        const updates: Record<string, unknown> = {};
        if (m.fatherId && idMap[m.fatherId]) updates.fatherId = idMap[m.fatherId];
        if (m.motherId && idMap[m.motherId]) updates.motherId = idMap[m.motherId];
        if (m.spouseId && idMap[m.spouseId]) updates.spouseId = idMap[m.spouseId];
        
        if (m.spouseIds && Array.isArray(m.spouseIds)) {
          updates.spouseIds = m.spouseIds.map((id: string) => idMap[id] || id).filter(Boolean);
        }

        if (Object.keys(updates).length > 0) {
          await updateDoc(doc(db, 'families', familyRef.id, 'people', newId), updates);
        }
      });

      await Promise.all(updatePromises);
      
      importedFamilies++;
      importedMembers += familyMembers.length;
    }

    return { importedFamilies, importedMembers };
  }

  /**
   * Trigger file input for importing JSON
   */
  triggerImportFileInput(onFileSelected: (file: File) => void): void {
    this.exportService.triggerImportFileInput(onFileSelected);
  }

  /**
   * Read JSON file content
   */
  readJSONFile<T>(file: File): Promise<T> {
    return this.exportService.readJSONFile<T>(file);
  }

  /**
   * Complete import flow
   */
  async handleImport(
    file: File,
    userUid: string | undefined
  ): Promise<{ importedFamilies: number; importedMembers: number }> {
    const toastId = toast.loading('Mengimpor data...');
    
    try {
      const data = await this.readJSONFile<{ family?: Family; families?: Family[]; members?: Member[] }>(file);
      const result = await this.importFamilyFromJSON(data, userUid);
      toast.success(
        `Berhasil mengimpor ${result.importedFamilies} keluarga dengan ${result.importedMembers} anggota!`,
        { id: toastId }
      );
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal mengimpor data.';
      toast.error(message, { id: toastId });
      throw error;
    }
  }
}

export const firebaseExportService = new FirebaseExportService();
