'use client'

interface StreamInterruptedProps {
  onReconnect: () => void
}

export function StreamInterrupted({ onReconnect }: StreamInterruptedProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
        <svg
          className="h-10 w-10 text-amber-600 dark:text-amber-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-foreground">Camera Stream Lost</h2>
        <p className="max-w-sm text-muted-foreground">
          The camera stream was interrupted.
        </p>
      </div>

      <button
        type="button"
        onClick={onReconnect}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-brand-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
      >
        Reconnect Camera
      </button>
    </div>
  )
}
