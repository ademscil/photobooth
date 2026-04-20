import type { CapturedFrame, CompositionOptions, ExportFormat, ExportOptions, ExportQuality } from '@/types'
import { compose } from '@/lib/composition/composer'
import { generateFilename } from './filename'

export const QUALITY_MAP: Record<ExportQuality, number> = {
  low: 0.7,
  medium: 0.85,
  high: 0.95,
}

const MIME_TYPE_MAP: Record<ExportFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
}

/**
 * Exports the composed photo as a downloadable file.
 * Export scale=4 gives ~2400px wide which is 4R print quality at 300dpi.
 */
export async function exportImage(
  frames: CapturedFrame[],
  compositionOptions: Omit<CompositionOptions, 'scale'>,
  exportOptions: ExportOptions,
): Promise<void> {
  const { format, quality } = exportOptions

  // scale=4 → 2400px wide → 4R print quality (300dpi at 10×15cm)
  const canvas = compose(frames, { ...compositionOptions, scale: 4 })

  const mimeType = MIME_TYPE_MAP[format]
  const qualityValue = format === 'jpeg' ? QUALITY_MAP[quality] : undefined

  return new Promise<void>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error('Failed to create image blob')); return }

        const url = URL.createObjectURL(blob)
        const filename = exportOptions.filename || generateFilename(format)

        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        resolve()
      },
      mimeType,
      qualityValue,
    )
  })
}
