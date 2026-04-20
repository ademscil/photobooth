'use client'

import { useEffect, useRef } from 'react'
import type { FilterId } from '@/types'
import { getCssFilterString } from '@/lib/filters/cssFilters'

interface CameraPreviewProps {
  /** The active MediaStream to display. Null shows a loading skeleton. */
  stream: MediaStream | null
  /** Active filter to apply as a CSS filter on the video element. */
  filter: FilterId
  /** Brightness adjustment (0–200, default 100). */
  brightness?: number
  /** Contrast adjustment (0–200, default 100). */
  contrast?: number
  /** Whether to mirror the preview horizontally (selfie mode). */
  mirrored?: boolean
  /** Whether the stream is active and producing frames. */
  isReady?: boolean
  /** Aspect ratio class for the container (e.g. 'aspect-[3/4]'). */
  aspectRatioClass?: string
}

/**
 * Live camera preview component.
 *
 * - Renders a <video> element managed via ref — never re-created on re-render.
 * - Applies CSS filter for live preview performance (no canvas operations).
 * - Mirrors horizontally when `mirrored` is true (front-facing cameras).
 * - Shows a loading skeleton while the stream is not yet ready.
 * - Wrapped in <figure> with accessible label per REQ-A11Y-06.
 */
export function CameraPreview({
  stream,
  filter,
  brightness = 100,
  contrast = 100,
  mirrored = true,
  isReady = false,
  aspectRatioClass = 'aspect-[4/3]',
}: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Assign stream to video element without re-creating the element
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (stream) {
      video.srcObject = stream
      // play() returns undefined in jsdom — guard with optional chaining
      video.play()?.catch(() => {
        // Autoplay may be blocked in some environments — safe to ignore
      })
    } else {
      video.srcObject = null
    }
  }, [stream])

  const cssFilter = getCssFilterString(filter, brightness, contrast)
  const mirrorStyle = mirrored ? 'scale-x-[-1]' : ''

  return (
    <figure
      className={`relative w-full overflow-hidden rounded-xl bg-neutral-900 ${aspectRatioClass}`}
      aria-label="Live camera preview"
    >
      {/* Loading skeleton — shown while stream is not ready */}
      {!isReady && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center bg-neutral-900"
        >
          <div className="flex flex-col items-center gap-3 text-neutral-500">
            <svg
              className="h-12 w-12 animate-pulse"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
            <span className="text-sm">
              {stream ? 'Starting camera…' : 'Waiting for camera…'}
            </span>
          </div>
        </div>
      )}

      {/* Video element — never re-created, stream assigned via ref */}
      <video
        ref={videoRef}
        aria-label="Live camera preview"
        autoPlay
        playsInline
        muted
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          isReady ? 'opacity-100' : 'opacity-0'
        } ${mirrorStyle}`}
        style={{ filter: cssFilter }}
      />

      {/* Accessible figcaption for screen readers */}
      <figcaption className="sr-only">
        Live camera preview
        {filter !== 'normal' ? `, ${filter} filter applied` : ''}
        {mirrored ? ', mirrored' : ''}
      </figcaption>
    </figure>
  )
}
