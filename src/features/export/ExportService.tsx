import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Family, Member } from '../../types';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

/**
 * Export family data to JSON file
 */
export function exportFamilyToJSON(family: Family, members: Member[], filename?: string): void {
  const data = {
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
 * Export members to CSV format
 */
export function exportMembersToCSV(members: Member[], familyName: string): void {
  const headers = ['Nama', 'Jenis Kelamin', 'Tanggal Lahir', 'Tanggal Wafat', 'Status Pernikahan', 'Ayah', 'Ibu', 'Pasangan', 'Bio'];
  
  const rows = members.map(m => {
    const father = members.find(x => x.id === m.fatherId);
    const mother = members.find(x => x.id === m.motherId);
    const spouse = members.find(x => x.id === m.spouseId);
    
    return [
      m.name,
      m.gender === 'male' ? 'Laki-laki' : m.gender === 'female' ? 'Perempuan' : 'Lainnya',
      m.birthDate || '',
      m.deathDate || '',
      m.maritalStatus === 'single' ? 'Lajang' : m.maritalStatus === 'married' ? 'Menikah' : m.maritalStatus === 'divorced' ? 'Cerai' : 'Janda/Duda',
      father?.name || '',
      mother?.name || '',
      spouse?.name || m.externalSpouseName || '',
      m.bio || ''
    ];
  });
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${familyName.replace(/[^a-z0-9]/gi, '-')}-anggota.csv`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
  toast.success('Data anggota berhasil diekspor ke CSV!');
}

/**
 * Export family statistics to text report
 */
export function exportStatsToText(family: Family, members: Member[]): void {
  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };
  
  const ages = members.map(m => calculateAge(m.birthDate)).filter(a => a !== null) as number[];
  const avgAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;
  const maxAge = ages.length > 0 ? Math.max(...ages) : 0;
  const minAge = ages.length > 0 ? Math.min(...ages) : 0;
  
  const males = members.filter(m => m.gender === 'male').length;
  const females = members.filter(m => m.gender === 'female').length;
  const married = members.filter(m => m.maritalStatus === 'married').length;
  const single = members.filter(m => m.maritalStatus === 'single').length;
  
  const content = `
LAPORAN STATISTIK KELUARGA
===========================
Keluarga: ${family.name}
Tanggal Laporan: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}

ANGGOTA KELUARGA
----------------
Total Anggota: ${members.length}
Laki-laki: ${males}
Perempuan: ${females}

UMUR
----
Rata-rata: ${avgAge} tahun
Termuda: ${minAge} tahun
Tertua: ${maxAge} tahun

STATUS PERNIKAHAN
----------------
Menikah: ${married}
Lajang: ${single}

DAFTAR ANGGOTA
--------------
${members.map(m => `- ${m.name} (${m.gender === 'male' ? 'L' : 'P'}, ${calculateAge(m.birthDate) || '?'} th)`).join('\n')}

---
Dicetak dari Silsilah Keluarga Kita
  `.trim();
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${family.name.replace(/[^a-z0-9]/gi, '-')}-laporan.txt`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
  toast.success('Laporan statistik berhasil diekspor!');
}

/**
 * Export all families to JSON file
 */
export function exportAllFamiliesToJSON(families: Family[], allMembers: Member[]): void {
  const data = {
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

interface ImportData {
  family?: Family;
  families?: Family[];
  members?: Member[];
  exportedAt?: string;
  version?: string;
}

/**
 * Import family data from JSON file
 */
export async function importFamilyFromJSON(
  data: ImportData,
  userUid: string | undefined
): Promise<{ importedFamilies: number; importedMembers: number }> {
  // Handle both single family export and all families export
  const familiesToImport = data.family ? [data.family] : (data.families || []);
  const allMembersToImport = data.members || [];

  if (familiesToImport.length === 0) {
    throw new Error('Format file tidak valid: Tidak ada data keluarga ditemukan.');
  }

  let importedFamilies = 0;
  let importedMembers = 0;

  for (const famData of familiesToImport) {
    // Create new family
    const familyRef = await addDoc(collection(db, 'families'), {
      name: `${famData.name} (Import)`,
      ownerId: userUid,
      collaborators: [],
      createdAt: Timestamp.now()
    });

    // Filter members for this family
    const familyMembers = allMembersToImport.filter((m) => m.familyId === famData.id || !m.familyId);

    // Map old IDs to new IDs
    const idMap: { [key: string]: string } = {};
    
    // First pass: Create members and get new IDs
    const createPromises = familyMembers.map(async (m) => {
      const { id, ...memberData } = m;
      // Remove old familyId if it exists, we'll use the new one
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
      
      // Handle spouseIds array if it exists
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
export function triggerImportFileInput(onFileSelected: (file: File) => void): void {
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
export function readJSONFile<T>(file: File): Promise<T> {
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

/**
 * Complete import flow
 */
export async function handleImport(
  file: File,
  userUid: string | undefined
): Promise<{ importedFamilies: number; importedMembers: number }> {
  const toastId = toast.loading('Mengimpor data...');
  
  try {
    const data = await readJSONFile<ImportData>(file);
    const result = await importFamilyFromJSON(data, userUid);
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
