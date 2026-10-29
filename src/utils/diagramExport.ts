/**
 * Utilities for rendering and exporting Mermaid diagrams as High-Resolution Images (PNG, SVG)
 */

export async function exportSvgToPng(
  svgElement: SVGSVGElement,
  fileName: string = 'diagram.png',
  scale: number = 3 // 3x scale for ultra-crisp 300 DPI quality
): Promise<void> {
  const blob = await svgToPngBlob(svgElement, scale);
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

export function exportSvgFile(svgElement: SVGSVGElement, fileName: string = 'diagram.svg'): void {
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);

  // Add name spaces if needed
  if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+xmlns\:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  // Prepend XML declaration
  source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.svg') ? fileName : `${fileName}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function copySvgToClipboard(svgElement: SVGSVGElement): Promise<boolean> {
  try {
    const blob = await svgToPngBlob(svgElement, 2);
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to copy diagram to clipboard:', err);
    return false;
  }
}

function svgToPngBlob(svgElement: SVGSVGElement, scale: number = 3): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const bbox = svgElement.getBoundingClientRect();
      const width = Math.max(bbox.width || 800, 600);
      const height = Math.max(bbox.height || 450, 400);

      const serializer = new XMLSerializer();
      let svgStr = serializer.serializeToString(svgElement);

      if (!svgStr.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgStr = svgStr.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const img = new Image();
      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to get canvas 2D context.'));
          return;
        }

        // Fill background with clean crisp white for export clarity
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add subtle margin / padding
        const padding = 20 * scale;
        ctx.drawImage(img, padding, padding, canvas.width - padding * 2, canvas.height - padding * 2);

        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to Blob conversion failed.'));
          }
        }, 'image/png');
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to render SVG image onto canvas.'));
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}
