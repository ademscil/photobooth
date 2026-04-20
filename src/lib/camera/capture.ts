import type { FilterId } from '@/types'
import { applyCanvasFilter } from '@/lib/filters/canvasFilters'

/**
 * Captures a single frame from a video element.
 *
 * - Creates an offscreen canvas at the video's native resolution.
 * - Mirrors horizontally when `mirrored` is true.
 * - Applies canvas pixel filter when filter is not 'normal'.
 * - Returns raw ImageData for storage in session state.
 */
export function captureFrame(
  videoEl: HTMLVideoElement,
  filter: FilterId,
  mirrored: boolean,
): ImageData {
  const w = videoEl.videoWidth
  const h = videoEl.videoHeight

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get 2D canvas context for capture')
  }

  if (mirrored) {
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
  }

  ctx.drawImage(videoEl, 0, 0)

  if (filter !== 'normal') {
    applyCanvasFilter(ctx, filter, w, h)
  }

  return ctx.getImageData(0, 0, w, h)
}
