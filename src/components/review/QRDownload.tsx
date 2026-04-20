'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { isCloudinaryConfigured } from '@/lib/export/cloudinaryUpload'

interface QRDownloadProps {
  sessionId: string
  uploadProgress?: string | null
  isUploading?: boolean
}

export function QRDownload({ sessionId, uploadProgress, isUploading }: QRDownloadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [qrError, setQrError] = useState(false)
  const cloudinaryEnabled = isCloudinaryConfigured()

  useEffect(() => {
    if (!sessionId || isUploading) return

    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const url = `${origin}/download/${sessionId}`
    setTimeout(() => setDownloadUrl(url), 0)

    const canvas = canvasRef.current
    if (!canvas) return

    QRCode.toCanvas(canvas, url, {
      width: 180,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    }).catch(() => setQrError(true))
  }, [sessionId, isUploading])

  if (isUploading) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-semibold text-foreground">📤 Mengupload Foto</p>
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" aria-hidden="true" />
        <p className="text-center text-xs text-muted-foreground">
          {uploadProgress ?? 'Menyiapkan foto...'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground">📱 Scan untuk Download Foto</p>

      {cloudinaryEnabled && (
        <p className="text-center text-xs text-green-600 dark:text-green-400">
          ✓ Foto tersimpan di cloud — bisa diakses kapan saja
        </p>
      )}

      {qrError ? (
        <p className="text-xs text-red-500">Gagal membuat QR code</p>
      ) : (
        <canvas
          ref={canvasRef}
          aria-label="QR code untuk download foto"
          className="rounded-lg"
        />
      )}

      {downloadUrl && (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="max-w-[200px] break-all text-center font-mono text-xs text-brand-primary underline underline-offset-2"
        >
          {downloadUrl}
        </a>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Scan QR dengan kamera HP untuk download soft file
      </p>
    </div>
  )
}
