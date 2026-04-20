'use client'

import { useState } from 'react'
import { PRICING_PACKAGES, type PaymentMethod, type PricingPackage } from '@/store/paymentStore'

interface PricingScreenProps {
  onSelectPackage: (pkg: PricingPackage, method: PaymentMethod) => void
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

export function PricingScreen({ onSelectPackage }: PricingScreenProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedPkg, setSelectedPkg] = useState<PricingPackage | null>(null)

  const handleSelect = (pkg: PricingPackage) => {
    setSelectedPkg(pkg)
  }

  const handleMethodSelect = (method: PaymentMethod) => {
    if (selectedPkg) onSelectPackage(selectedPkg, method)
  }

  if (selectedPkg) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Pilih Metode Bayar</h2>
          <p className="mt-2 text-muted-foreground">
            Paket <strong>{selectedPkg.name}</strong> — {formatRupiah(selectedPkg.price)}
          </p>
        </div>
        <div className="grid w-full max-w-sm grid-cols-1 gap-4">
          <button
            type="button"
            onClick={() => handleMethodSelect('qris')}
            className="flex items-center gap-4 rounded-2xl border-2 border-border p-5 text-left transition-all hover:border-brand-primary hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            <span className="text-3xl" aria-hidden="true">📱</span>
            <div>
              <p className="font-semibold text-foreground">QRIS</p>
              <p className="text-sm text-muted-foreground">GoPay, OVO, Dana, ShopeePay, dll</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleMethodSelect('cash')}
            className="flex items-center gap-4 rounded-2xl border-2 border-border p-5 text-left transition-all hover:border-brand-primary hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            <span className="text-3xl" aria-hidden="true">💵</span>
            <div>
              <p className="font-semibold text-foreground">Cash</p>
              <p className="text-sm text-muted-foreground">Masukkan kode voucher dari kasir</p>
            </div>
          </button>
        </div>
        <button
          type="button"
          onClick={() => setSelectedPkg(null)}
          className="text-sm text-muted-foreground underline-offset-2 hover:underline"
        >
          ← Kembali pilih paket
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 p-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Pilih Paket Foto</h2>
        <p className="mt-2 text-muted-foreground">
          Semua paket sudah termasuk <strong>2 sesi foto</strong> masing-masing <strong>5 menit</strong>
        </p>
      </div>

      {/* Package cards */}
      <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        {PRICING_PACKAGES.map((pkg) => {
          const isHovered = hoveredId === pkg.id
          const isPremium = pkg.id === 'premium'

          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => handleSelect(pkg)}
              onMouseEnter={() => setHoveredId(pkg.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`relative flex flex-col rounded-2xl border-2 p-6 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
                isPremium
                  ? 'border-brand-primary shadow-lg shadow-brand-primary/10'
                  : 'border-border'
              } ${isHovered ? 'scale-[1.02] shadow-xl' : ''}`}
            >
              {isPremium && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-white">
                    Populer
                  </span>
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground">{pkg.name}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{pkg.description}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-foreground">
                    {formatRupiah(pkg.price)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ sesi</span>
                </div>
              </div>
              <ul className="mb-6 flex-1 space-y-2">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div
                className={`w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors ${
                  isPremium
                    ? 'bg-brand-primary text-white'
                    : 'border border-border bg-background text-foreground'
                }`}
              >
                Pilih {pkg.name}
              </div>
            </button>
          )
        })}
      </div>

      <p className="max-w-md text-center text-xs text-muted-foreground">
        Pembayaran menggunakan <strong>QRIS</strong> atau <strong>Cash</strong> dengan kode voucher.
      </p>
    </div>
  )
}
