/**
 * Print Templates
 * HTML templates for print functionality
 */

import { isLandscapeOrientation } from './printUtils';

interface PrintTemplateOptions {
  svgData: string;
  familyName?: string;
  width: number;
  height: number;
}

/**
 * Generates the print HTML template
 */
export const generatePrintTemplate = ({ svgData, familyName, width, height }: PrintTemplateOptions): string => {
  const isLandscape = isLandscapeOrientation(width, height);
  
  return `
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
  `;
};

/**
 * Opens a print window with the given HTML content
 */
export const openPrintWindow = (htmlContent: string): Window | null => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return null;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  return printWindow;
};

/**
 * Creates a download link for a blob
 */
export const createDownloadLink = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Converts SVG to blob for download
 */
export const svgToBlob = (svgData: string, type: 'image/svg+xml' | 'image/png'): Blob => {
  return new Blob([svgData], { type });
};

export default {
  generatePrintTemplate,
  openPrintWindow,
  createDownloadLink,
  svgToBlob
};