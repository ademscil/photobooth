/**
 * Server-trusted pricing package registry.
 *
 * This is the single source of truth for package prices. The payment
 * create endpoint derives `gross_amount` from `packageId` using this map,
 * so a client cannot manipulate the amount it is charged.
 *
 * Prices may be overridden at deploy time via NEXT_PUBLIC_PHOTO_PRICE
 * (basic) — premium is derived as a fixed multiple to keep tiers aligned.
 */

export type PackageId = 'basic' | 'premium'

export interface ServerPackage {
  id: PackageId
  name: string
  price: number
}

function basePrice(): number {
  const raw = Number(process.env.NEXT_PUBLIC_PHOTO_PRICE)
  return Number.isFinite(raw) && raw > 0 ? raw : 15000
}

/** Returns the canonical, server-trusted price for a package id. */
export function getPackagePrice(packageId: string): number | null {
  const base = basePrice()
  switch (packageId) {
    case 'basic':
      return base
    case 'premium':
      // Premium is priced at the base plus a fixed Rp 10.000 tier uplift,
      // matching the Basic/Premium gap presented in the UI.
      return base + 10000
    default:
      return null
  }
}

/** Returns the canonical package definition, or null for an unknown id. */
export function getServerPackage(packageId: string): ServerPackage | null {
  const price = getPackagePrice(packageId)
  if (price === null) return null
  return {
    id: packageId as PackageId,
    name: packageId === 'premium' ? 'Premium' : 'Basic',
    price,
  }
}
