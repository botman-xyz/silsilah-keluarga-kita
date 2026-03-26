import { toast } from 'sonner';

interface PrepareSvgResult {
  clone: SVGSVGElement;
  width: number;
  height: number;
}

/**
 * Prepares an SVG element for export by:
 * 1. Getting the actual content bounds
 * 2. Cloning the SVG to avoid modifying the original
 * 3. Converting external images to base64
 * 4. Adding necessary styles
 */
export async function prepareSvgForExport(svg: SVGSVGElement): Promise<PrepareSvgResult | null> {
  // Get the main group that contains all elements
  const g = svg.querySelector('g');
  if (!g) return null;
  
  // Get the actual content size (raw coordinates)
  const bounds = g.getBBox();
  const padding = 20; // Reduced padding for tighter fit
  
  const width = bounds.width + padding * 2;
  const height = bounds.height + padding * 2;
  
  // Clone the SVG to avoid modifying the original
  const clone = svg.cloneNode(true) as SVGSVGElement;
  
  // CRITICAL: Remove the transform attribute from the cloned group 
  // to ensure the viewBox maps correctly to the raw coordinates
  const cloneG = clone.querySelector('g');
  if (cloneG) {
    cloneG.removeAttribute('transform');
  }

  clone.setAttribute('width', width.toString());
  clone.setAttribute('height', height.toString());
  clone.setAttribute('viewBox', `${bounds.x - padding} ${bounds.y - padding} ${width} ${height}`);
  
  // Convert all images to base64 to avoid CORS issues
  const images = clone.querySelectorAll('image');
  const imagePromises = Array.from(images).map(async (img) => {
    const href = img.getAttribute('xlink:href') || img.getAttribute('href');
    if (href && !href.startsWith('data:')) {
      try {
        const response = await fetch(href);
        const blob = await response.blob();
        return new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            img.setAttribute('xlink:href', reader.result as string);
            img.setAttribute('href', reader.result as string);
            resolve();
          };
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn('Failed to convert image to base64:', href);
      }
    }
  });
  
  await Promise.all(imagePromises);

  // Add necessary styles for standalone SVG rendering
  const style = document.createElement('style');
  style.textContent = `
    .fill-slate-900 { fill: #0f172a; }
    .fill-slate-500 { fill: #64748b; }
    .fill-slate-400 { fill: #94a3b8; }
    .fill-slate-300 { fill: #cbd5e1; }
    .fill-blue-500 { fill: #3b82f6; }
    .fill-blue-600 { fill: #2563eb; }
    .fill-blue-700 { fill: #1d4ed8; }
    .fill-pink-500 { fill: #ec4899; }
    .fill-pink-600 { fill: #db2777; }
    .fill-pink-700 { fill: #be185d; }
    .font-bold { font-weight: bold; }
    .font-black { font-weight: 900; }
    .font-medium { font-weight: 500; }
    .italic { font-style: italic; }
    .uppercase { text-transform: uppercase; }
    .text-[8px] { font-size: 8px; }
    .text-[9px] { font-size: 9px; }
    .text-[10px] { font-size: 10px; }
    .text-[11px] { font-size: 11px; }
    .text-[12px] { font-size: 12px; }
    .text-[14px] { font-size: 14px; }
    .text-xs { font-size: 12px; }
    .text-sm { font-size: 14px; }
    .text-base { font-size: 16px; }
    .tracking-tight { letter-spacing: -0.025em; }
    .tracking-[0.2em] { letter-spacing: 0.2em; }
    text { font-family: 'Inter', -apple-system, sans-serif; }
  `;
  clone.insertBefore(style, clone.firstChild);
  
  return { clone, width, height };
}

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
    const isLandscape = width > height;
    const svgData = new XMLSerializer().serializeToString(clone);
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
    const svgData = new XMLSerializer().serializeToString(clone);
    
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
      const scale = 2; // Higher resolution
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
