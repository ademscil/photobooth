'use client'

import { use, useEffect, useState } from 'react'
import { getSessionDownloadData, type SessionDownloadData } from '@/lib/export/downloadLink'

export default function DownloadPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const [data, setData] = useState<SessionDownloadData | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const result = getSessionDownloadData(sessionId)
    if (result) {
      setTimeout(() => setData(result), 0)
    } else {
      setTimeout(() => setNotFound(true), 0)
    }
  }, [sessionId])

  const handleDownload = (downloadUrl: string, label: string) => {
    if (downloadUrl.startsWith('data:')) {
      // Local data URL — trigger download
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `${label.toLowerCase().replace(/\s+/g, '-')}.jpg`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else {
      // Cloudinary URL — open in new tab (fl_attachment handles download)
      window.open(downloadUrl, '_blank', 'noopener,noreferrer')
    }
  }

  if (notFound) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="text-5xl" aria-hidden="true">😕</span>
        <h1 className="text-xl font-bold text-foreground">Sesi tidak ditemukan</h1>
        <p className="text-sm text-muted-foreground">
          Link download hanya berlaku di browser yang sama saat sesi foto berlangsung.
        </p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" aria-label="Memuat..." />
          <p className="text-sm text-muted-foreground">Memuat foto...</p>
        </div>
      </main>
    )
  }

  const templatePhotos = data.photos.filter((p) => p.label.includes('Template'))
  const originalPhotos = data.photos.filter((p) => p.label.includes('Original'))

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-background p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">📷 Download Foto Kamu</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap foto untuk download ke galeri HP
        </p>
        {data.photos.some((p) => p.isCloudinary) && (
          <p className="mt-1 text-xs text-green-600">✓ Foto tersimpan di cloud — bisa diakses kapan saja</p>
        )}
      </div>

      {/* Template photos */}
      {templatePhotos.length > 0 && (
        <div className="flex w-full max-w-sm flex-col gap-3">
          <p className="text-xs font-semibold text-muted-foreground">🎨 Foto Template</p>
          {templatePhotos.map((photo) => (
            <div key={photo.url} className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleDownload(photo.downloadUrl, photo.label)}
                className="overflow-hidden rounded-xl border border-border shadow-md transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.label} className="w-full" />
              </button>
              <button
                type="button"
                onClick={() => handleDownload(photo.downloadUrl, photo.label)}
                className="rounded-lg bg-brand-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary"
              >
                ⬇️ Download {photo.label}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Original photos */}
      {originalPhotos.length > 0 && (
        <div className="flex w-full max-w-sm flex-col gap-3">
          <p className="text-xs font-semibold text-muted-foreground">📷 Foto Original</p>
          <div className="grid grid-cols-2 gap-2">
            {originalPhotos.map((photo) => (
              <button
                key={photo.url}
                type="button"
                onClick={() => handleDownload(photo.downloadUrl, photo.label)}
                className="flex flex-col gap-1 overflow-hidden rounded-xl border border-border shadow-sm transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.label} className="w-full" />
                <span className="pb-1.5 text-center text-xs text-muted-foreground">
                  ⬇️ {photo.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        © Photobooth — Abadikan Momen Terbaik Kamu
      </p>
    </main>
  )
}
