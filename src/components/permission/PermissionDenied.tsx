'use client'

import { useEffect, useRef } from 'react'

interface PermissionDeniedProps {
  onRetry: () => void
}

export function PermissionDenied({ onRetry }: PermissionDeniedProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div
      className="flex flex-col items-center justify-center gap-6 p-8 text-center"
      aria-live="assertive"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
        <svg
          className="h-10 w-10 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-semibold text-foreground focus-visible:outline-none"
        >
          Camera Access Blocked
        </h2>
        <p className="max-w-sm text-muted-foreground">
          Camera permission was denied. Follow these steps to re-enable it:
        </p>
      </div>

      <div className="w-full max-w-sm rounded-lg border border-border bg-muted/50 p-4 text-left">
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-1 text-sm font-medium text-foreground">Chrome</p>
            <ol className="list-decimal pl-4 text-sm text-muted-foreground space-y-1">
              <li>Click the lock icon in the address bar</li>
              <li>Set Camera to &quot;Allow&quot;</li>
              <li>Reload the page</li>
            </ol>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-foreground">Firefox</p>
            <ol className="list-decimal pl-4 text-sm text-muted-foreground space-y-1">
              <li>Click the shield icon in the address bar</li>
              <li>Click &quot;Connection Secure&quot; → &quot;More Information&quot;</li>
              <li>Go to Permissions and allow Camera</li>
            </ol>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-foreground">Safari</p>
            <ol className="list-decimal pl-4 text-sm text-muted-foreground space-y-1">
              <li>Open Safari → Settings → Websites</li>
              <li>Select Camera and allow this site</li>
              <li>Reload the page</li>
            </ol>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-brand-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
      >
        Try Again
      </button>
    </div>
  )
}
