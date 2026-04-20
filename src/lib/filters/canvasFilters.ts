import type { FilterId } from '@/types'

/**
 * Applies a pixel-level filter to a canvas region using ImageData manipulation.
 * This produces export-accurate results that match the CSS filter preview.
 *
 * @param ctx - The 2D rendering context of the canvas.
 * @param filterId - The filter preset to apply.
 * @param width - Width of the region to process.
 * @param height - Height of the region to process.
 */
export function applyCanvasFilter(
  ctx: CanvasRenderingContext2D,
  filterId: FilterId,
  width: number,
  height: number,
): void {
  if (filterId === 'normal') return

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    // alpha (data[i + 3]) is left unchanged

    switch (filterId) {
      case 'grayscale': {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b
        data[i] = gray
        data[i + 1] = gray
        data[i + 2] = gray
        break
      }

      case 'bw': {
        // Grayscale then threshold at 128, with contrast boost
        const gray = 0.299 * r + 0.587 * g + 0.114 * b
        // Boost contrast: shift toward 0 or 255
        const boosted = gray < 128 ? Math.max(0, gray * 0.6) : Math.min(255, gray * 1.2 + 20)
        const bwVal = boosted < 128 ? 0 : 255
        data[i] = bwVal
        data[i + 1] = bwVal
        data[i + 2] = bwVal
        break
      }

      case 'sepia': {
        // Standard sepia matrix
        const sr = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
        const sg = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
        const sb = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
        data[i] = sr
        data[i + 1] = sg
        data[i + 2] = sb
        break
      }

      case 'vintage': {
        // Sepia + slight desaturation + brightness reduction
        // First apply sepia
        const vr = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
        const vg = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
        const vb = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
        // Then reduce brightness by 5% and desaturate slightly
        const gray = 0.299 * vr + 0.587 * vg + 0.114 * vb
        const desatFactor = 0.85
        const brightFactor = 0.95
        data[i] = Math.min(255, (vr * desatFactor + gray * (1 - desatFactor)) * brightFactor)
        data[i + 1] = Math.min(255, (vg * desatFactor + gray * (1 - desatFactor)) * brightFactor)
        data[i + 2] = Math.min(255, (vb * desatFactor + gray * (1 - desatFactor)) * brightFactor)
        break
      }

      default:
        break
    }
  }

  ctx.putImageData(imageData, 0, 0)
}
