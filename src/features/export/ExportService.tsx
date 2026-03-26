import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Family, Member } from '../../types';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { calculateAge } from '../../lib/utils';
import { firebaseExportService } from '../../infrastructure/services/ExportService';

/**
 * Export members to CSV format
 * Uses shared calculateAge from lib/utils (DRY)
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
 * Uses shared calculateAge from lib/utils (DRY)
 */
export function exportStatsToText(family: Family, members: Member[]): void {
  const ages = members.map(m => calculateAge(m.birthDate, m.deathDate)).filter(a => a !== null) as number[];
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
${members.map(m => `- ${m.name} (${m.gender === 'male' ? 'L' : 'P'}, ${calculateAge(m.birthDate, m.deathDate) || '?'} th)`).join('\n')}

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

// Re-export JSON functions from infrastructure for convenience
export { firebaseExportService as exportService };

// Convenience exports that delegate to infrastructure
export const exportFamilyToJSON = firebaseExportService.exportFamilyToJSON;
export const exportAllFamiliesToJSON = firebaseExportService.exportAllFamiliesToJSON;
export const importFamilyFromJSON = firebaseExportService.importFamilyFromJSON;
export const triggerImportFileInput = firebaseExportService.triggerImportFileInput;
export const readJSONFile = firebaseExportService.readJSONFile;
export const handleImport = firebaseExportService.handleImport;
