import { describe, expect, it } from 'vitest'
import { getCssFilterString } from '@/lib/filters/cssFilters'

describe('getCssFilterString', () => {
  it('returns "none" for normal filter with no adjustments', () => {
    expect(getCssFilterString('normal')).toBe('none')
  })

  it('returns correct CSS for grayscale filter', () => {
    expect(getCssFilterString('grayscale')).toBe('grayscale(100%)')
  })

  it('returns correct CSS for bw filter', () => {
    expect(getCssFilterString('bw')).toBe('grayscale(100%) contrast(150%) brightness(110%)')
  })

  it('returns correct CSS for sepia filter', () => {
    expect(getCssFilterString('sepia')).toBe('sepia(80%)')
  })

  it('returns correct CSS for vintage filter', () => {
    expect(getCssFilterString('vintage')).toBe(
      'sepia(40%) contrast(90%) brightness(95%) saturate(85%)',
    )
  })

  it('appends brightness adjustment when brightness !== 100', () => {
    const result = getCssFilterString('normal', 120, 100)
    expect(result).toBe('brightness(120%)')
  })

  it('appends contrast adjustment when contrast !== 100', () => {
    const result = getCssFilterString('normal', 100, 80)
    expect(result).toBe('contrast(80%)')
  })

  it('appends both brightness and contrast adjustments', () => {
    const result = getCssFilterString('normal', 110, 90)
    expect(result).toBe('brightness(110%) contrast(90%)')
  })

  it('combines base filter with brightness/contrast adjustments', () => {
    const result = getCssFilterString('sepia', 110, 95)
    expect(result).toBe('sepia(80%) brightness(110%) contrast(95%)')
  })

  it('does not append adjustments when both are 100', () => {
    const result = getCssFilterString('grayscale', 100, 100)
    expect(result).toBe('grayscale(100%)')
  })
})
