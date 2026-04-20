'use client'

import type { FilterId } from '@/types'
import { FILTER_IDS, FILTER_NAMES } from '@/lib/filters/filterDefinitions'

interface FilterSelectorProps {
  value: FilterId
  onChange: (id: FilterId) => void
  disabled?: boolean
}

const FILTER_COLORS: Record<FilterId, string> = {
  normal:    'bg-gradient-to-br from-blue-200 to-pink-200',
  grayscale: 'bg-gradient-to-br from-neutral-300 to-neutral-500',
  bw:        'bg-gradient-to-br from-neutral-100 to-neutral-900',
  sepia:     'bg-gradient-to-br from-amber-200 to-amber-600',
  vintage:   'bg-gradient-to-br from-amber-100 to-rose-300',
}

export function FilterSelector({ value, onChange, disabled = false }: FilterSelectorProps) {
  const handleArrowKey = (e: React.KeyboardEvent, currentIndex: number) => {
    let next = currentIndex
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (currentIndex + 1) % FILTER_IDS.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (currentIndex - 1 + FILTER_IDS.length) % FILTER_IDS.length
    else return
    e.preventDefault()
    if (!disabled) onChange(FILTER_IDS[next])
    document.getElementById(`filter-${FILTER_IDS[next]}`)?.focus()
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">Filter</p>
      {/* Grid layout — 5 equal columns, no overflow */}
      <div
        role="radiogroup"
        aria-label="Photo filter"
        className="grid grid-cols-5 gap-1"
      >
        {FILTER_IDS.map((id, i) => {
          const isSelected = value === id
          return (
            <div
              key={id}
              id={`filter-${id}`}
              role="radio"
              aria-checked={isSelected}
              aria-label={FILTER_NAMES[id]}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => !disabled && onChange(id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!disabled) onChange(id) }
                handleArrowKey(e, i)
              }}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 ${
                isSelected ? 'bg-brand-primary/10' : 'hover:bg-muted'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <div
                className={`h-8 w-8 rounded-full ${FILTER_COLORS[id]} transition-all ${
                  isSelected
                    ? 'ring-2 ring-brand-primary ring-offset-1'
                    : 'hover:ring-2 hover:ring-brand-primary/40 hover:ring-offset-1'
                }`}
              />
              <span className={`text-[10px] leading-tight text-center ${
                isSelected ? 'font-semibold text-brand-primary' : 'text-muted-foreground'
              }`}>
                {FILTER_NAMES[id]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
