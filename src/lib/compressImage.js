/**
 * Compresses an image File to WebP at ≤300KB.
 * Tries quality steps from 0.85 down to 0.1 until size is under the limit.
 * Returns a new File in image/webp format.
 */
export async function compressImageToWebP(file, maxBytes = 300 * 1024) {
  const bitmap = await createImageBitmap(file);

  // Scale down large images to max 1280px wide while preserving aspect ratio
  const MAX_DIM = 1280;
  let { width, height } = bitmap;
  if (width > MAX_DIM || height > MAX_DIM) {
    const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Try progressively lower quality until under maxBytes
  const qualities = [0.85, 0.75, 0.65, 0.5, 0.35, 0.2, 0.1];
  for (const q of qualities) {
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', q));
    if (!blob) continue;
    if (blob.size <= maxBytes || q === 0.1) {
      return new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
    }
  }

  // Fallback: return as-is if canvas API unavailable
  return file;
}