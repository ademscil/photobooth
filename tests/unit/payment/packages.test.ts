import { afterEach, describe, expect, it, vi } from 'vitest'
import { getPackagePrice, getServerPackage } from '@/lib/payment/packages'

describe('payment package registry', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns default basic/premium prices when no env override', () => {
    vi.stubEnv('NEXT_PUBLIC_PHOTO_PRICE', '')
    expect(getPackagePrice('basic')).toBe(15000)
    expect(getPackagePrice('premium')).toBe(25000)
  })

  it('honours NEXT_PUBLIC_PHOTO_PRICE override for the base tier', () => {
    vi.stubEnv('NEXT_PUBLIC_PHOTO_PRICE', '20000')
    expect(getPackagePrice('basic')).toBe(20000)
    expect(getPackagePrice('premium')).toBe(30000)
  })

  it('ignores invalid price overrides and falls back to the default', () => {
    vi.stubEnv('NEXT_PUBLIC_PHOTO_PRICE', 'not-a-number')
    expect(getPackagePrice('basic')).toBe(15000)
  })

  it('returns null for unknown package ids', () => {
    expect(getPackagePrice('enterprise')).toBeNull()
    expect(getPackagePrice('')).toBeNull()
    expect(getServerPackage('bogus')).toBeNull()
  })

  it('builds a server package with the trusted price', () => {
    vi.stubEnv('NEXT_PUBLIC_PHOTO_PRICE', '15000')
    expect(getServerPackage('basic')).toEqual({ id: 'basic', name: 'Basic', price: 15000 })
    expect(getServerPackage('premium')).toEqual({ id: 'premium', name: 'Premium', price: 25000 })
  })
})
