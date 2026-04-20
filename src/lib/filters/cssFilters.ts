import type { FilterId } from '@/types'
import { CSS_FILTER_MAP } from './filterDefinitions'

/**
 * Generates a CSS `filter` property string for the given filter preset,
 * combined with optional brightness and contrast adjustments.
 *
 * Used for live camera preview — no canvas operations involved.
 *
 * @param filterId - The active filter preset ID.
 * @param brightness - Brightness value (0–200, default 100 = no change).
 * @param contrast - Contrast value (0–200, default 100 = no change).
 * @returns A CSS filter string suitable for the `style.filter` property.
 *
 * @example
 * getCssFilterString('sepia', 110, 95)
 * // → 'sepia(80%) brightness(110%) contrast(95%)'
 */
export function getCssFilterString(
  filterId: FilterId,
  brightness = 100,
  contrast = 100,
): string {
  const base = CSS_FILTER_MAP[filterId] ?? 'none'

  const adjustments: string[] = []

  if (brightness !== 100) {
    adjustments.push(`brightness(${brightness}%)`)
  }
  if (contrast !== 100) {
    adjustments.push(`contrast(${contrast}%)`)
  }

  if (adjustments.length === 0) {
    return base
  }

  // Append adjustments to the base filter string
  if (base === 'none') {
    return adjustments.join(' ')
  }

  return `${base} ${adjustments.join(' ')}`
}
