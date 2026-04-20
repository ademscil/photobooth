'use client'

interface PermissionRequestProps {
  onRequestPermission: () => void
}

export function PermissionRequest({ onRequestPermission }: PermissionRequestProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-6 p-8 text-center"
      aria-live="polite"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary/10">
        <svg
          className="h-10 w-10 text-brand-primary"
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
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-foreground">Allow Camera Access</h2>
        <p className="max-w-sm text-muted-foreground">
          We need access to your camera to take photos. Your photos stay on your device.
        </p>
      </div>

      <button
        type="button"
        onClick={onRequestPermission}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-brand-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
      >
        Allow Camera
      </button>
    </div>
  )
}
