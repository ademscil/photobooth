'use client'

import { useEffect, useRef, useState } from 'react'
import type { CapturedFrame, CustomTemplate, FilterId, TemplateId } from '@/types'
import type { FrameStyle } from '@/lib/composition/frameTemplates'
import { compose } from '@/lib/composition/composer'

interface ReviewCanvasProps {
  frames: CapturedFrame[]
  templateId: TemplateId
  filterId: FilterId
  frameEnabled: boolean
  labelText: string
  customTemplate?: CustomTemplate | null
  frameStyle?: FrameStyle
}

export function ReviewCanvas({ frames, templateId, filterId, frameEnabled, labelText, customTemplate, frameStyle }: ReviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [composeError, setComposeError] = useState<string | null>(null)

  useEffect(() => {
    if (frames.length === 0) return

    setTimeout(() => setComposeError(null), 0)
    const id = requestAnimationFrame(() => {
      try {
        const composed = compose(frames, {
          template: templateId,
          filter: filterId,
          frameEnabled,
          labelText,
          scale: 1,
          customTemplate: customTemplate ?? undefined,
          frameStyle,
        })

        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = composed.width
        canvas.height = composed.height
        const ctx = canvas.getContext('2d')
        if (!ctx) { setTimeout(() => setComposeError('Canvas context unavailable'), 0); return }
        ctx.drawImage(composed, 0, 0)
      } catch (err) {
        console.error('[ReviewCanvas] Composition failed:', err)
        setTimeout(() => setComposeError(err instanceof Error ? err.message : 'Composition failed'), 0)
      }
    })

    return () => cancelAnimationFrame(id)
  }, [frames, templateId, filterId, frameEnabled, labelText, customTemplate, frameStyle])

  if (composeError) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
        Gagal menampilkan preview: {composeError}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="max-h-[70vh] max-w-full rounded-lg shadow-lg"
        aria-label="Composed photo preview"
      />
    </div>
  )
}
