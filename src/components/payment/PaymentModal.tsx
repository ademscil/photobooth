'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { generateOrderId, usePaymentStore } from '@/store/paymentStore'

interface PaymentModalProps {
  onPaymentSuccess: () => void
  onCancel: () => void
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function CashPaymentForm({ amount, onSuccess, onCancel }: { amount: number; onSuccess: () => void; onCancel: () => void }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/payment/voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), amount }),
      })
      const data = await res.json()
      if (data.valid) {
        onSuccess()
      } else {
        setError(data.message ?? 'Kode voucher tidak valid')
      }
    } catch {
      setError('Gagal memvalidasi kode. Periksa koneksi internet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <span className="text-2xl" aria-hidden="true">💵</span>
        </div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Bayar Cash</h2>
        <p className="mt-1 text-sm text-neutral-500">Masukkan kode voucher dari kasir</p>
      </div>

      <div className="rounded-xl bg-neutral-50 p-4 text-center dark:bg-neutral-800">
        <p className="text-sm text-neutral-500">Total Pembayaran</p>
        <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-white">{formatRupiah(amount)}</p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="voucher-code" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Kode Voucher
        </label>
        <input
          id="voucher-code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Contoh: CASH001"
          autoComplete="off"
          className="rounded-lg border border-input bg-background px-3 py-2.5 font-mono text-sm uppercase tracking-widest text-foreground placeholder:normal-case placeholder:tracking-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading || !code.trim()} className="w-full">
        {loading ? 'Memvalidasi...' : 'Konfirmasi Pembayaran'}
      </Button>
      <Button type="button" variant="outline" onClick={onCancel} className="w-full">
        Batalkan
      </Button>
    </form>
  )
}

export function PaymentModal({ onPaymentSuccess, onCancel }: PaymentModalProps) {
  const { status, orderId, amount, error, paymentMethod, setStatus, setOrderId, setSnapToken, setError, reset } =
    usePaymentStore()

  const [isPolling, setIsPolling] = useState(false)
  const [snapReady, setSnapReady] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentOrderRef = useRef<string | null>(null)

  // Load Midtrans Snap script and wait for it to be ready
  useEffect(() => {
    if (paymentMethod === 'cash') return

    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
    const snapUrl = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'

    const markReady = () => setTimeout(() => setSnapReady(true), 0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).snap) {
      const t = setTimeout(() => setSnapReady(true), 0)
      return () => clearTimeout(t)
    }

    const existing = document.querySelector(`script[src="${snapUrl}"]`)
    if (existing) {
      existing.addEventListener('load', markReady)
      return () => existing.removeEventListener('load', markReady)
    }

    const script = document.createElement('script')
    script.src = snapUrl
    script.setAttribute('data-client-key', clientKey ?? '')
    script.async = true
    script.onload = markReady
    script.onerror = () => {
      setError('Gagal memuat payment gateway. Periksa koneksi internet.')
      setStatus('failed')
    }
    document.head.appendChild(script)

    return () => {
      script.removeEventListener('load', markReady)
    }
  }, [paymentMethod, setError, setStatus])

  const startPolling = useCallback((oid: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    setIsPolling(true)
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status?orderId=${oid}`)
        const data = await res.json()
        if (data.isPaid) {
          clearInterval(pollingRef.current!)
          setIsPolling(false)
          setStatus('paid')
          onPaymentSuccess()
        }
      } catch {
        // ignore
      }
    }, 3000)
  }, [onPaymentSuccess, setStatus])

  const initiatePayment = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snap = (window as any).snap
    if (!snap) {
      setError('Payment gateway belum siap. Tunggu sebentar dan coba lagi.')
      setStatus('failed')
      return
    }

    setStatus('creating')
    setError(null)

    const newOrderId = generateOrderId()
    currentOrderRef.current = newOrderId
    setOrderId(newOrderId)

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: newOrderId, amount }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error ?? 'Gagal membuat transaksi')
      }

      const data = await res.json()
      setSnapToken(data.token)
      setStatus('pending')

      snap.pay(data.token, {
        onSuccess: () => {
          setStatus('paid')
          onPaymentSuccess()
        },
        onPending: () => {
          setStatus('pending')
          startPolling(newOrderId)
        },
        onError: (result: unknown) => {
          console.error('Snap payment error:', result)
          setStatus('failed')
          setError('Pembayaran gagal. Silakan coba lagi.')
        },
        onClose: () => {
          if (currentOrderRef.current) {
            startPolling(currentOrderRef.current)
          }
        },
      })
    } catch (err) {
      setStatus('failed')
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    }
  }, [amount, onPaymentSuccess, setError, setOrderId, setSnapToken, setStatus, startPolling])

  // Auto-initiate once Snap is ready (QRIS only)
  useEffect(() => {
    if (paymentMethod === 'qris' && snapReady && status === 'idle') {
      initiatePayment()
    }
  }, [paymentMethod, snapReady, status, initiatePayment])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  const handleCancel = () => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    reset()
    onCancel()
  }

  const handleCashSuccess = () => {
    setStatus('paid')
    onPaymentSuccess()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pembayaran"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
        {/* Cash payment */}
        {paymentMethod === 'cash' && (
          <CashPaymentForm amount={amount} onSuccess={handleCashSuccess} onCancel={handleCancel} />
        )}

        {/* QRIS payment */}
        {paymentMethod === 'qris' && (
          <>
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                <svg className="h-7 w-7 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 18.75h.75v.75h-.75v-.75ZM18.75 13.5h.75v.75h-.75v-.75ZM18.75 18.75h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Pembayaran QRIS</h2>
              <p className="mt-1 text-sm text-neutral-500">Scan QR dengan GoPay, OVO, Dana, atau e-wallet lainnya</p>
            </div>

            <div className="mb-6 rounded-xl bg-neutral-50 p-4 text-center dark:bg-neutral-800">
              <p className="text-sm text-neutral-500">Total Pembayaran</p>
              <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-white">{formatRupiah(amount)}</p>
              {orderId && <p className="mt-1 font-mono text-xs text-neutral-400">{orderId}</p>}
            </div>

            <div aria-live="polite" className="mb-6 min-h-[40px] text-center">
              {!snapReady && status === 'idle' && (
                <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memuat payment gateway...
                </div>
              )}
              {status === 'creating' && (
                <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Membuat transaksi...
                </div>
              )}
              {status === 'pending' && (
                <div className="space-y-1">
                  {isPolling && (
                    <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Menunggu konfirmasi pembayaran...
                    </div>
                  )}
                  {!isPolling && (
                    <p className="text-sm text-neutral-500">Popup QR sudah terbuka. Scan dan bayar.</p>
                  )}
                </div>
              )}
              {status === 'paid' && (
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Pembayaran berhasil!
                </div>
              )}
              {status === 'failed' && (
                <p className="text-sm text-red-600">{error ?? 'Pembayaran gagal.'}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {(status === 'pending' || status === 'failed') && (
                <Button onClick={initiatePayment} className="w-full">
                  {status === 'failed' ? 'Coba Lagi' : 'Buka QR Lagi'}
                </Button>
              )}

              {/* Sandbox test button */}
              {process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION !== 'true' && status !== 'paid' && (
                <button
                  type="button"
                  onClick={() => {
                    if (pollingRef.current) clearInterval(pollingRef.current)
                    setIsPolling(false)
                    setStatus('paid')
                    onPaymentSuccess()
                  }}
                  className="w-full rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 py-2.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
                >
                  🧪 Simulasi Bayar (Sandbox Only)
                </button>
              )}

              {status !== 'paid' && (
                <Button variant="outline" onClick={handleCancel} className="w-full">
                  Batalkan
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
