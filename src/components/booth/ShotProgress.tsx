'use client'

interface ShotProgressProps {
  currentShot: number
  totalShots: number
}

export function ShotProgress({ currentShot, totalShots }: ShotProgressProps) {
  if (totalShots <= 1) return null
  if (currentShot === 0) return null

  // currentShot is 1-based and increments after capture, so captured = currentShot - 1
  const captured = Math.max(0, currentShot - 1)

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-medium text-foreground">
        Shot {Math.min(currentShot, totalShots)} of {totalShots}
      </p>

      {/* Visual dots */}
      <div className="flex gap-2" role="img" aria-label={`${captured} of ${totalShots} shots captured`}>
        {Array.from({ length: totalShots }, (_, i) => (
          <div
            key={i}
            className={`h-2.5 w-2.5 rounded-full transition-colors duration-200 ${
              i < captured
                ? 'bg-brand-primary'
                : 'bg-neutral-300 dark:bg-neutral-600'
            }`}
          />
        ))}
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {captured > 0 ? `Shot ${captured} of ${totalShots} captured` : ''}
      </div>
    </div>
  )
}
