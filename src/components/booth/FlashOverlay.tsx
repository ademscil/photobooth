'use client'

interface FlashOverlayProps {
  isFlashing: boolean
}

export function FlashOverlay({ isFlashing }: FlashOverlayProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-150 ${
        isFlashing ? 'opacity-100' : 'opacity-0'
      }`}
    />
  )
}
