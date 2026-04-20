'use client'

import { useCallback, useRef, useState } from 'react'
import type { CustomTemplate, TemplateSlot } from '@/types'

interface CustomTemplateBuilderProps {
  onSave: (template: CustomTemplate) => void
  onCancel: () => void
  existing?: CustomTemplate | null
}

type ShotCount = 1 | 2 | 4

const PRESETS: { label: string; shotCount: ShotCount; slots: TemplateSlot[]; w: number; h: number }[] = [
  {
    label: '1 Foto (Portrait)',
    shotCount: 1,
    w: 900, h: 1200,
    slots: [{ x: 0.05, y: 0.05, width: 0.9, height: 0.75 }],
  },
  {
    label: '2 Foto (Vertikal)',
    shotCount: 2,
    w: 900, h: 1400,
    slots: [
      { x: 0.05, y: 0.04, width: 0.9, height: 0.44 },
      { x: 0.05, y: 0.52, width: 0.9, height: 0.44 },
    ],
  },
  {
    label: '4 Foto (Strip)',
    shotCount: 4,
    w: 600, h: 2000,
    slots: [
      { x: 0.05, y: 0.02, width: 0.9, height: 0.22 },
      { x: 0.05, y: 0.26, width: 0.9, height: 0.22 },
      { x: 0.05, y: 0.50, width: 0.9, height: 0.22 },
      { x: 0.05, y: 0.74, width: 0.9, height: 0.22 },
    ],
  },
  {
    label: '4 Foto (Grid)',
    shotCount: 4,
    w: 1200, h: 1200,
    slots: [
      { x: 0.02, y: 0.02, width: 0.46, height: 0.46 },
      { x: 0.52, y: 0.02, width: 0.46, height: 0.46 },
      { x: 0.02, y: 0.52, width: 0.46, height: 0.46 },
      { x: 0.52, y: 0.52, width: 0.46, height: 0.46 },
    ],
  },
]

export function CustomTemplateBuilder({ onSave, onCancel, existing }: CustomTemplateBuilderProps) {
  const [name, setName] = useState(existing?.name ?? 'Template Saya')
  const [selectedPreset, setSelectedPreset] = useState(0)
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(existing?.backgroundImage)
  const [overlayImage, setOverlayImage] = useState<string | undefined>(existing?.overlayImage)
  const [bgFileName, setBgFileName] = useState('')
  const [overlayFileName, setOverlayFileName] = useState('')

  const bgInputRef = useRef<HTMLInputElement>(null)
  const overlayInputRef = useRef<HTMLInputElement>(null)

  const preset = PRESETS[selectedPreset]

  const handleFileUpload = useCallback(
    (type: 'background' | 'overlay') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        if (type === 'background') {
          setBackgroundImage(dataUrl)
          setBgFileName(file.name)
        } else {
          setOverlayImage(dataUrl)
          setOverlayFileName(file.name)
        }
      }
      reader.readAsDataURL(file)
    },
    [],
  )

  const handleSave = () => {
    const template: CustomTemplate = {
      name: name.trim() || 'Custom Template',
      backgroundImage,
      overlayImage,
      shotCount: preset.shotCount,
      canvasWidth: preset.w,
      canvasHeight: preset.h,
      slots: preset.slots,
    }
    onSave(template)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buat Template Custom"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-neutral-900 overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Buat Template Custom</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Upload background dan overlay untuk template branded kamu
          </p>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
          {/* Template name */}
          <div className="space-y-1.5">
            <label htmlFor="template-name" className="text-sm font-medium text-foreground">
              Nama Template
            </label>
            <input
              id="template-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Wedding Ayu & Budi"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Layout preset */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">Layout Foto</p>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setSelectedPreset(i)}
                  className={`rounded-lg border-2 p-3 text-left text-sm transition-colors ${
                    selectedPreset === i
                      ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                      : 'border-border bg-background text-foreground hover:border-brand-primary/50'
                  }`}
                >
                  <span className="font-medium">{p.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {p.w}×{p.h}px · {p.shotCount} foto
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Background image */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">
              Background <span className="text-muted-foreground font-normal">(opsional)</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Gambar yang muncul di belakang foto. Format: JPG, PNG. Ukuran sesuai layout.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => bgInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                Upload Background
              </button>
              {bgFileName && (
                <div className="flex items-center gap-1.5">
                  <span className="max-w-[150px] truncate text-xs text-green-600">✓ {bgFileName}</span>
                  <button
                    type="button"
                    onClick={() => { setBackgroundImage(undefined); setBgFileName('') }}
                    className="text-xs text-muted-foreground hover:text-destructive"
                    aria-label="Hapus background"
                  >✕</button>
                </div>
              )}
            </div>
            <input
              ref={bgInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="sr-only"
              onChange={handleFileUpload('background')}
              aria-label="Upload gambar background"
            />
            {backgroundImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={backgroundImage}
                alt="Preview background"
                className="mt-2 h-24 w-full rounded-lg object-cover border border-border"
              />
            )}
          </div>

          {/* Overlay image */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">
              Overlay / Frame <span className="text-muted-foreground font-normal">(opsional)</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Gambar PNG transparan yang muncul di atas foto. Cocok untuk frame event, logo, atau watermark.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => overlayInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                Upload Overlay PNG
              </button>
              {overlayFileName && (
                <div className="flex items-center gap-1.5">
                  <span className="max-w-[150px] truncate text-xs text-green-600">✓ {overlayFileName}</span>
                  <button
                    type="button"
                    onClick={() => { setOverlayImage(undefined); setOverlayFileName('') }}
                    className="text-xs text-muted-foreground hover:text-destructive"
                    aria-label="Hapus overlay"
                  >✕</button>
                </div>
              )}
            </div>
            <input
              ref={overlayInputRef}
              type="file"
              accept="image/png"
              className="sr-only"
              onChange={handleFileUpload('overlay')}
              aria-label="Upload gambar overlay PNG"
            />
            {overlayImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={overlayImage}
                alt="Preview overlay"
                className="mt-2 h-24 w-full rounded-lg object-contain border border-border bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTVlN2ViIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=')]"
              />
            )}
          </div>

          {/* Preview info */}
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Tips:</strong> Untuk hasil terbaik, buat overlay PNG dengan ukuran{' '}
            <strong>{preset.w}×{preset.h}px</strong> dan area foto transparan sesuai posisi slot.
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-secondary"
          >
            Gunakan Template Ini
          </button>
        </div>
      </div>
    </div>
  )
}
