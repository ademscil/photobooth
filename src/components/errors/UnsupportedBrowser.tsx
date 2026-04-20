'use client'

import { isSecureContext } from '@/lib/utils/browser'

export function UnsupportedBrowser() {
  const insecure = typeof window !== 'undefined' && !isSecureContext()

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
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
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-foreground">
          Browser Not Supported
        </h2>
        {insecure ? (
          <p className="max-w-sm text-muted-foreground">
            Camera access requires a secure connection (HTTPS). Please open this
            page over HTTPS or use localhost.
          </p>
        ) : (
          <p className="max-w-sm text-muted-foreground">
            Your browser doesn&apos;t support camera access. Please use one of
            the supported browsers below.
          </p>
        )}
      </div>

      <div className="w-full max-w-sm rounded-lg border border-border bg-muted/50 p-4 text-left">
        <p className="mb-2 text-sm font-medium text-foreground">Supported browsers</p>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>Chrome 90+</li>
          <li>Firefox 88+</li>
          <li>Safari 14.1+</li>
          <li>Edge 90+</li>
        </ul>
      </div>
    </div>
  )
}
