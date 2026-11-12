/**
 * Utility to client-side compress and resize property photos
 * Target size: 800x600 px (4:3) or proportional landscape, ~40KB - 80KB each.
 */
export interface CompressedPhoto {
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
}

export async function compressPropertyPhoto(file: File): Promise<CompressedPhoto> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('फोटो पढ़ने में असमर्थ'));
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('फोटो लोड करने में असमर्थ'));
      img.onload = () => {
        // Max bounds for property photos (850x640)
        const MAX_WIDTH = 850;
        const MAX_HEIGHT = 640;

        let targetWidth = img.width;
        let targetHeight = img.height;

        if (targetWidth > MAX_WIDTH || targetHeight > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / targetWidth, MAX_HEIGHT / targetHeight);
          targetWidth = Math.round(targetWidth * ratio);
          targetHeight = Math.round(targetHeight * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          const sizeKb = Math.round(rawDataUrl.length * 0.75 / 1024);
          resolve({
            dataUrl: rawDataUrl,
            sizeKb,
            width: img.width,
            height: img.height
          });
          return;
        }

        // Fill background white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Quality 0.72 achieves great visual clarity for houses while keeping size ~40-75 KB
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.72);
        const approxSizeKb = Math.round((compressedDataUrl.length * 0.75) / 1024);

        resolve({
          dataUrl: compressedDataUrl,
          sizeKb: approxSizeKb,
          width: targetWidth,
          height: targetHeight
        });
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}
