'use client'

import { useState } from 'react'
import type { CapturedFrame } from '@/types'
import { usePrintStore } from '@/store/printStore'

interface PrintOrderPanelProps {
  frames: CapturedFrame[]
  templateId: string
  sessionIndex: number
}

const PRINT_PRICE = Number(process.env.NEXT_PUBLIC_PRINT_PRICE ?? 5000)

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

function FrameThumb({ imageData }: { imageData: ImageData }) {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')!
  ctx.putImageData(imageData, 0, 0)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={canvas.toDataURL('image/jpeg', 0.7)}
      alt="Thumbnail foto"
      className="h-16 w-16 rounded-lg object-cover"
    />
  )
}

export function PrintOrderPanel({ frames, templateId, sessionIndex }: PrintOrderPanelProps) {
  const { orders, addOrder, removeOrder, updateQuantity, getTotalPrice } = usePrintStore()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const existingIndex = orders.findIndex(
    (o) => o.sessionIndex === sessionIndex && o.templateId === templateId,
  )
  const existing = existingIndex >= 0 ? orders[existingIndex] : null

  const handleAdd = () => {
    if (existing) {
      updateQuantity(existingIndex, existing.quantity + qty)
    } else {
      addOrder({ sessionIndex, templateId, quantity: qty, pricePerPrint: PRINT_PRICE })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleRemove = () => {
    if (existingIndex >= 0) removeOrder(existingIndex)
  }

  const total = getTotalPrice()

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">🖨️ Cetak Foto</h3>
        <span className="text-xs text-muted-foreground">{formatRupiah(PRINT_PRICE)} / cetak</span>
      </div>

      {/* Thumbnails */}
      {frames.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {frames.map((f) => (
            <FrameThumb key={f.timestamp} imageData={f.imageData} />
          ))}
        </div>
      )}

      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <label htmlFor={`qty-${sessionIndex}`} className="text-xs text-muted-foreground">
          Jumlah cetak:
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Kurangi jumlah"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            −
          </button>
          <input
            id={`qty-${sessionIndex}`}
            type="number"
            min={1}
            max={99}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            className="w-12 rounded-md border border-input bg-background px-2 py-1 text-center text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            aria-label="Tambah jumlah"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            +
          </button>
        </div>
        <span className="text-xs text-muted-foreground">= {formatRupiah(qty * PRINT_PRICE)}</span>
      </div>

      {/* Current order */}
      {existing && (
        <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-xs dark:bg-green-950">
          <span className="text-green-700 dark:text-green-300">
            ✓ {existing.quantity} cetak ditambahkan
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="text-red-500 underline-offset-2 hover:underline"
          >
            Hapus
          </button>
        </div>
      )}

      {added && !existing && (
        <p role="status" className="text-xs text-green-600">Ditambahkan ke pesanan!</p>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
      >
        🖨️ {existing ? 'Tambah Lagi' : 'Tambah ke Pesanan'}
      </button>

      {total > 0 && (
        <div className="border-t border-border pt-2 text-right text-xs font-semibold text-foreground">
          Total cetak: {formatRupiah(total)}
        </div>
      )}
    </div>
  )
}
