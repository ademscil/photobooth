import type { ExportFormat } from '@/types'

/**
 * Generates a timestamped filename for the exported photo.
 * Uses local time in the format: photobooth-YYYY-MM-DD-HHmmss.{format}
 */
export function generateFilename(format: ExportFormat): string {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `photobooth-${year}-${month}-${day}-${hours}${minutes}${seconds}.${format}`
}
