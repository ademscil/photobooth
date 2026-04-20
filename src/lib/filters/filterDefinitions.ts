import type { FilterId } from '@/types'

/**
 * CSS filter string for each filter preset.
 * Used for live preview performance (no canvas operations).
 */
export const CSS_FILTER_MAP: Record<FilterId, string> = {
  normal: 'none',
  grayscale: 'grayscale(100%)',
  bw: 'grayscale(100%) contrast(150%) brightness(110%)',
  sepia: 'sepia(80%)',
  vintage: 'sepia(40%) contrast(90%) brightness(95%) saturate(85%)',
}

/** Human-readable display names for each filter. */
export const FILTER_NAMES: Record<FilterId, string> = {
  normal: 'Normal',
  grayscale: 'Grayscale',
  bw: 'B&W',
  sepia: 'Sepia',
  vintage: 'Vintage',
}

/** Ordered list of all filter IDs for UI rendering. */
export const FILTER_IDS: FilterId[] = ['normal', 'grayscale', 'bw', 'sepia', 'vintage']
