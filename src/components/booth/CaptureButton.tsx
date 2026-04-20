'use client'

interface CaptureButtonProps {
  onCapture: () => void
  disabled?: boolean
  isCountingDown?: boolean
}

export function CaptureButton({
  onCapture,
  disabled = false,
  isCountingDown = false,
}: CaptureButtonProps) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <button
        type="button"
        onClick={onCapture}
        disabled={disabled || isCountingDown}
        aria-label="Take photo"
        title={disabled ? 'Waiting for camera…' : undefined}
        className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
        style={{ minHeight: 44, minWidth: 44 }}
      >
        {/* Outer ring */}
        <span className="absolute inset-0 rounded-full border-4 border-neutral-300" />
        {/* Inner circle */}
        <span
          className={`h-11 w-11 rounded-full transition-colors ${
            disabled || isCountingDown ? 'bg-neutral-300' : 'bg-neutral-800 hover:bg-brand-primary'
          }`}
        />
      </button>
    </div>
  )
}
