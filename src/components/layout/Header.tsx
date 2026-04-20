import Link from 'next/link'

interface HeaderProps {
  showStartOver?: boolean
  onStartOver?: () => void
}

export function Header({ showStartOver = false, onStartOver }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <Link
        href="/"
        className="text-lg font-bold text-foreground hover:text-brand-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 rounded"
      >
        Photobooth
      </Link>

      {showStartOver && onStartOver && (
        <button
          type="button"
          onClick={onStartOver}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
        >
          Start Over
        </button>
      )}
    </header>
  )
}
