/**
 * Print Service
 * UI orchestration for print/download functionality
 */

import { toast } from 'sonner';
import { prepareSvgForExport, serializeSvg } from './printUtils';
import { generatePrintTemplate, openPrintWindow, createDownloadLink, svgToBlob } from './printTemplates';

/**
 * Gets the SVG element from the DOM
 */
const getSvgElement = (): SVGSVGElement | null => {
  return document.querySelector('.family-tree-svg') as SVGSVGElement;
};

/**
 * Opens a print window with the prepared SVG
 */
export async function handlePrint(familyName?: string): Promise<void> {
  const svg = getSvgElement();
  if (!svg) {
    toast.error('Silsilah keluarga tidak ditemukan.');
    return;
  }
  
  const toastId = toast.loading('Menyiapkan dokumen cetak...');
  
  try {
    const result = await prepareSvgForExport(svg);
    if (!result) {
      toast.dismiss(toastId);
      toast.error('Gagal mempersiapkan silsilah untuk dicetak.');
      return;
    }
    
    const { clone, width, height } = result;
    const svgData = serializeSvg(clone);
    
    const htmlContent = generatePrintTemplate({
      svgData,
      familyName,
      width,
      height
    });
    
    const printWindow = openPrintWindow(htmlContent);
    if (!printWindow) {
      toast.error('Gagal membuka jendela cetak. Pastikan pop-up diizinkan.', { id: toastId });
      return;
    }
    
    toast.success('Dokumen cetak siap!', { id: toastId });
  } catch (error) {
    console.error('Print error:', error);
    toast.error('Gagal menyiapkan dokumen cetak.', { id: toastId });
  }
}

/**
 * Downloads the SVG as an image file
 */
export async function handleDownload(format: 'svg' | 'png' = 'svg'): Promise<void> {
  const svg = getSvgElement();
  if (!svg) {
    toast.error('Silsilah keluarga tidak ditemukan.');
    return;
  }

  const toastId = toast.loading('Menyiapkan unduhan...');
  
  try {
    const result = await prepareSvgForExport(svg);
    if (!result) {
      toast.dismiss(toastId);
      toast.error('Gagal mempersiapkan silsilah untuk diunduh.');
      return;
    }
    
    const { clone, width, height } = result;
    const svgData = serializeSvg(clone);
    
    if (format === 'svg') {
      const blob = svgToBlob(svgData, 'image/svg+xml');
      createDownloadLink(blob, 'silsilah-keluarga.svg');
      toast.success('Silsilah berhasil diunduh!', { id: toastId });
    } else {
      // Download as PNG
      const canvas = document.createElement('canvas');
      const scale = 2;
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error('Gagal membuat canvas.', { id: toastId });
        return;
      }
      
      const img = new Image();
      const svgBlob = svgToBlob(svgData, 'image/svg+xml');
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        
        canvas.toBlob((blob) => {
          if (blob) {
            createDownloadLink(blob, 'silsilah-keluarga.png');
            toast.success('Silsilah berhasil diunduh!', { id: toastId });
          } else {
            toast.error('Gagal mengonversi ke PNG.', { id: toastId });
          }
        }, 'image/png');
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast.error('Gagal memuat gambar.', { id: toastId });
      };
      
      img.src = url;
    }
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Gagal mengunduh silsilah.', { id: toastId });
  }
}
