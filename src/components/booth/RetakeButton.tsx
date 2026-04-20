'use client'

interface RetakeButtonProps {
  onRetake: () => void
  disabled?: boolean
  capturedCount: number
}

export function RetakeButton({ onRetake, disabled = false, capturedCount }: RetakeButtonProps) {
  if (capturedCount < 1) return null

  return (
    <button
      type="button"
      onClick={onRetake}
      disabled={disabled}
      aria-label="Retake last photo"
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {/* Undo icon */}
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
        />
      </svg>
      Retake
    </button>
  )
}
