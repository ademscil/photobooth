'use client'

import { useState } from 'react'
import type { CapturedFrame, CompositionOptions, ExportQuality } from '@/types'
import { exportImage } from '@/lib/export/exporter'
import { generateFilename } from '@/lib/export/filename'
import { exportBoomerangAsWebM } from '@/lib/export/gifExporter'
import { PaymentModal } from '@/components/payment/PaymentModal'
import { usePaymentStore } from '@/store/paymentStore'

interface ExportPanelProps {
  frames: CapturedFrame[]
  compositionOptions: Omit<CompositionOptions, 'scale'>
  onStartOver: () => void
}

type ExportStatus = 'idle' | 'exporting' | 'done' | 'error'

const PAYMENT_ENABLED =
  typeof process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY === 'string' &&
  process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY.length > 0

function exportOriginalFrame(imageData: ImageData, index: number): void {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')!
  ctx.putImageData(imageData, 0, 0)
  const ts = Date.now()
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `photobooth-original-${index + 1}-${ts}.png`
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}

export function ExportPanel({ frames, compositionOptions, onStartOver }: ExportPanelProps) {
  const [jpegQuality, setJpegQuality] = useState<ExportQuality>('high')
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle')
  const [boomerangStatus, setBoomerangStatus] = useState<ExportStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [pendingFormat, setPendingFormat] = useState<'png' | 'jpeg' | null>(null)

  const { status: paymentStatus, reset: resetPayment } = usePaymentStore()
  const isPaid = paymentStatus === 'paid'

  const handleExport = async (format: 'png' | 'jpeg') => {
    if (PAYMENT_ENABLED && !isPaid) {
      setPendingFormat(format)
      setShowPayment(true)
      return
    }
    await doExport(format)
  }

  const doExport = async (format: 'png' | 'jpeg') => {
    setExportStatus('exporting')
    setErrorMessage(null)
    try {
      await exportImage(frames, compositionOptions, {
        format,
        quality: jpegQuality,
        filename: generateFilename(format),
      })
      setExportStatus('done')
      setTimeout(() => setExportStatus('idle'), 3000)
    } catch (err) {
      console.error('[ExportPanel] Export failed:', err)
      setErrorMessage(err instanceof Error ? err.message : 'Export failed')
      setExportStatus('error')
    }
  }

  const handlePaymentSuccess = async () => {
    setShowPayment(false)
    if (pendingFormat) {
      await doExport(pendingFormat)
      setPendingFormat(null)
    }
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
    setPendingFormat(null)
    resetPayment()
  }

  const handleBoomerang = async () => {
    setBoomerangStatus('exporting')
    try {
      await exportBoomerangAsWebM(frames.map((f) => f.imageData), 12)
      setBoomerangStatus('done')
      setTimeout(() => setBoomerangStatus('idle'), 3000)
    } catch (err) {
      console.error('[ExportPanel] Boomerang failed:', err)
      setBoomerangStatus('error')
    }
  }

  const isExporting = exportStatus === 'exporting'
  const isBoomeranging = boomerangStatus === 'exporting'

  return (
    <>
      {showPayment && (
        <PaymentModal
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Download</h3>
          {PAYMENT_ENABLED && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                isPaid
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
              }`}
            >
              {isPaid ? '✓ Lunas' : 'Belum bayar'}
            </span>
          )}
        </div>

        <div aria-live="polite" className="sr-only">
          {exportStatus === 'exporting' && 'Exporting photo, please wait'}
          {exportStatus === 'done' && 'Photo downloaded successfully'}
          {exportStatus === 'error' && `Export failed: ${errorMessage}`}
        </div>

        {exportStatus === 'error' && (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            {errorMessage ?? 'Export failed. Please try again.'}
          </div>
        )}
        {exportStatus === 'done' && (
          <div role="status" className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
            Foto berhasil didownload!
          </div>
        )}

        {PAYMENT_ENABLED && !isPaid && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            💳 Bayar dengan QRIS atau Cash untuk download foto
          </div>
        )}

        {/* Foto Original */}
        {frames.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <p className="text-xs font-semibold text-muted-foreground">📷 Foto Original</p>
            <div className="flex flex-wrap gap-2">
              {frames.map((frame, i) => (
                <button
                  key={frame.timestamp}
                  type="button"
                  onClick={() => exportOriginalFrame(frame.imageData, i)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Foto {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Foto Template */}
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <p className="text-xs font-semibold text-muted-foreground">🎨 Foto Template</p>
          <button
            type="button"
            onClick={() => handleExport('png')}
            disabled={isExporting}
            aria-label={PAYMENT_ENABLED && !isPaid ? 'Bayar dan download PNG' : 'Download PNG'}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            {isExporting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            )}
            {PAYMENT_ENABLED && !isPaid ? '💳 Bayar & Download PNG' : 'Download PNG'}
          </button>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label htmlFor="jpeg-quality" className="text-xs font-medium text-muted-foreground">
                JPEG quality
              </label>
              <select
                id="jpeg-quality"
                value={jpegQuality}
                onChange={(e) => setJpegQuality(e.target.value as ExportQuality)}
                disabled={isExporting}
                className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => handleExport('jpeg')}
              disabled={isExporting}
              aria-label={PAYMENT_ENABLED && !isPaid ? 'Bayar dan download JPEG' : 'Download JPEG'}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {isExporting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" aria-hidden="true" />
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              )}
              {PAYMENT_ENABLED && !isPaid ? '💳 Bayar & Download JPEG' : 'Download JPEG'}
            </button>
          </div>
        </div>

        {/* Boomerang */}
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <p className="text-xs font-semibold text-muted-foreground">🎁 Boomerang / GIF</p>
          {boomerangStatus === 'done' && (
            <div role="status" className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
              Boomerang berhasil didownload!
            </div>
          )}
          {boomerangStatus === 'error' && (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              Gagal membuat boomerang. Browser mungkin tidak mendukung.
            </div>
          )}
          <button
            type="button"
            onClick={handleBoomerang}
            disabled={isBoomeranging || frames.length === 0}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {isBoomeranging ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" aria-hidden="true" />
            ) : (
              <span aria-hidden="true">🎁</span>
            )}
            {isBoomeranging ? 'Membuat Boomerang...' : 'Buat & Download Boomerang'}
          </button>
        </div>

        {/* Selesai */}
        <div className="border-t border-border pt-3">
          <button
            type="button"
            onClick={onStartOver}
            disabled={isExporting}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Selesai &amp; Lanjut
          </button>
        </div>
      </div>
    </>
  )
}
