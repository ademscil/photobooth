'use client'

import type { CountdownDuration } from '@/types'

interface CountdownSelectorProps {
  value: CountdownDuration
  onChange: (d: CountdownDuration) => void
  disabled?: boolean
}

const OPTIONS: CountdownDuration[] = [3, 5, 10]

export function CountdownSelector({ value, onChange, disabled = false }: CountdownSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">Countdown</p>
      <div
        role="radiogroup"
        aria-label="Countdown duration"
        className="flex gap-2"
      >
        {OPTIONS.map((opt) => {
          const isSelected = value === opt
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(opt)}
              className={`min-h-[44px] min-w-[44px] rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected
                  ? 'border-brand-primary bg-brand-primary text-white'
                  : 'border-border bg-background text-foreground hover:border-brand-primary/50 hover:bg-muted'
              }`}
            >
              {opt}s
            </button>
          )
        })}
      </div>
    </div>
  )
}
