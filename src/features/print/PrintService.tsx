/**
 * Print Service
 * UI orchestration for print/download functionality
 */

import { toast } from 'sonner';
import { prepareSvgForExport, serializeSvg, isLandscapeOrientation } from './printUtils';

/**
 * Opens a print window with the prepared SVG
 */
export async function handlePrint(familyName?: string): Promise<void> {
  const svg = document.querySelector('.family-tree-svg') as SVGSVGElement;
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
    const isLandscape = isLandscapeOrientation(width, height);
    const svgData = serializeSvg(clone);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Gagal membuka jendela cetak. Pastikan pop-up diizinkan.', { id: toastId });
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Silsilah - ${familyName || 'Keluarga'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
            
            @page {
              size: ${isLandscape ? 'landscape' : 'portrait'};
              margin: 0;
            }

            body { 
              margin: 0; 
              padding: 0;
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh; 
              font-family: 'Inter', sans-serif; 
              background: #f1f5f9; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .container {
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 40px;
              box-sizing: border-box;
            }

            svg { 
              width: auto;
              height: auto;
              max-width: 95%; 
              max-height: 85vh; 
              background: white;
              border-radius: 24px;
              box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.1);
            }

            @media print {
              .no-print { display: none; }
              body { background: white; }
              .container { padding: 0; }
              svg { 
                filter: none; 
                width: 100vw;
                height: 100vh;
                max-width: 100vw; 
                max-height: 100vh; 
                box-shadow: none;
                border-radius: 0;
              }
            }

            .controls { 
              position: fixed; 
              top: 20px; 
              left: 50%;
              transform: translateX(-50%);
              z-index: 100; 
              background: white/80;
              backdrop-blur: md;
              padding: 12px 24px;
              border-radius: 20px;
              box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
              display: flex;
              gap: 12px;
              align-items: center;
            }

            .hint {
              font-size: 12px;
              color: #64748b;
              font-weight: 500;
            }

            button { 
              padding: 10px 20px; 
              background: #2563eb; 
              color: white; 
              border: none; 
              border-radius: 12px; 
              cursor: pointer; 
              font-weight: bold; 
              transition: all 0.2s;
            }
            button:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="controls no-print">
            <div class="hint">Tips: Pilih "Save as PDF" dan orientasi "${isLandscape ? 'Landscape' : 'Portrait'}"</div>
            <button onclick="window.print()">Cetak / Simpan PDF</button>
          </div>
          <div class="container">
            ${svgData}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
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
  const svg = document.querySelector('.family-tree-svg') as SVGSVGElement;
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
      // Download as SVG
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'silsilah-keluarga.svg';
      link.click();
      URL.revokeObjectURL(url);
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
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'silsilah-keluarga.png';
            link.click();
            URL.revokeObjectURL(link.href);
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
