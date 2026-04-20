'use client'

interface CountdownOverlayProps {
  count: number
  isRunning: boolean
}

export function CountdownOverlay({ count, isRunning }: CountdownOverlayProps) {
  if (!isRunning) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      {/* Visual countdown number */}
      <span
        key={count}
        className="animate-ping-once text-8xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        style={{
          animation: 'countdownPulse 0.9s ease-out forwards',
        }}
      >
        {count}
      </span>

      {/* Screen reader announcement */}
      <span className="sr-only" aria-live="assertive" aria-atomic="true">
        {count}
      </span>
    </div>
  )
}
