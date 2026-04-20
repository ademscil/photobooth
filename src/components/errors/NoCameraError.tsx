'use client'

import { useEffect, useRef, useState } from 'react'

interface NoCameraErrorProps {
  onRetry: () => void
}

export function NoCameraError({ onRetry }: NoCameraErrorProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [showDslrGuide, setShowDslrGuide] = useState(false)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 text-center max-w-lg mx-auto">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
        <svg className="h-10 w-10 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold text-foreground focus-visible:outline-none">
          Kamera Tidak Ditemukan
        </h2>
        <p className="text-muted-foreground">
          Browser tidak bisa mendeteksi kamera. Coba langkah berikut:
        </p>
      </div>

      {/* General checklist */}
      <ul className="w-full rounded-lg border border-border bg-muted/50 p-4 text-left space-y-2">
        {[
          'Pastikan kabel USB kamera/capture card sudah terhubung',
          'Cek izin kamera di pengaturan OS (Windows: Settings → Privacy → Camera)',
          'Tutup aplikasi lain yang menggunakan kamera (Zoom, Teams, dll)',
          'Coba refresh halaman setelah menghubungkan kamera',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-foreground">
            <span className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true">•</span>
            {item}
          </li>
        ))}
      </ul>

      {/* DSLR guide */}
      <div className="w-full rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <button
          type="button"
          onClick={() => setShowDslrGuide(!showDslrGuide)}
          className="flex w-full items-center justify-between p-4 text-left text-sm font-medium text-blue-800 dark:text-blue-200"
          aria-expanded={showDslrGuide}
        >
          <span>📷 Pakai kamera DSLR/Mirrorless (Canon, Sony, dll)?</span>
          <svg className={`h-4 w-4 shrink-0 transition-transform ${showDslrGuide ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </button>

        {showDslrGuide && (
          <div className="border-t border-blue-200 p-4 text-left dark:border-blue-800">
            <p className="mb-3 text-sm text-blue-700 dark:text-blue-300">
              DSLR/mirrorless perlu <strong>HDMI Capture Card</strong> agar bisa digunakan sebagai kamera di browser.
              Ini adalah cara paling mudah dan tidak perlu install software apapun.
            </p>

            <div className="rounded-lg bg-white p-4 dark:bg-neutral-900">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Cara setup HDMI Capture Card
              </h3>
              <ol className="space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">1</span>
                  <span>Hubungkan kamera ke capture card via kabel <strong>HDMI</strong> (Canon 700D pakai HDMI Mini)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">2</span>
                  <span>Hubungkan capture card ke PC/laptop via <strong>USB</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">3</span>
                  <span>Aktifkan <strong>Live View</strong> di kamera (tombol LV)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">4</span>
                  <span>Klik <strong>Coba Lagi</strong> di bawah — kamera akan muncul otomatis</span>
                </li>
              </ol>

              <div className="mt-3 rounded-md bg-neutral-50 p-3 dark:bg-neutral-800">
                <p className="text-xs font-medium text-foreground">Rekomendasi capture card:</p>
                <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                  <li>• <strong>Ezcap 311</strong> / Acasis HD — Rp 150–300rb (Tokopedia/Shopee)</li>
                  <li>• <strong>Elgato Cam Link 4K</strong> — Rp 1.5jt (kualitas premium)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-brand-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
      >
        Coba Lagi
      </button>
    </div>
  )
}
