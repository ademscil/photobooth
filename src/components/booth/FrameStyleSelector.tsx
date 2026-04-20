'use client'

import type { FrameStyle } from '@/types'
import { FRAME_CONFIGS } from '@/lib/composition/frameTemplates'

interface FrameStyleSelectorProps {
  value: FrameStyle
  onChange: (style: FrameStyle) => void
  disabled?: boolean
}

export function FrameStyleSelector({ value, onChange, disabled = false }: FrameStyleSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">Frame Style</p>
      <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Frame style">
        {FRAME_CONFIGS.map((config) => {
          const isSelected = value === config.id
          return (
            <button
              key={config.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={config.name}
              title={config.description}
              disabled={disabled}
              onClick={() => !disabled && onChange(config.id)}
              className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 ${
                isSelected
                  ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                  : 'border-border bg-background text-muted-foreground hover:border-brand-primary/50'
              } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <FramePreview style={config.id} />
              <span className="text-[10px] font-medium leading-tight">{config.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FramePreview({ style }: { style: FrameStyle }) {
  const size = 28
  switch (style) {
    case 'none':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
          <rect x="2" y="2" width="24" height="24" rx="2" fill="currentColor" opacity="0.15" />
          <line x1="4" y1="4" x2="24" y2="24" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <line x1="24" y1="4" x2="4" y2="24" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        </svg>
      )
    case 'classic':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
          <rect x="2" y="2" width="24" height="24" rx="2" fill="currentColor" opacity="0.1" />
          <rect x="2" y="2" width="24" height="24" rx="2" fill="none" stroke="#c9a84c" strokeWidth="4" />
          <rect x="5.5" y="5.5" width="17" height="17" rx="1" fill="none" stroke="#f5d78e" strokeWidth="1.5" />
        </svg>
      )
    case 'floral':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
          <rect x="2" y="2" width="24" height="24" rx="2" fill="currentColor" opacity="0.1" />
          <rect x="2" y="2" width="24" height="24" rx="2" fill="none" stroke="#f9a8d4" strokeWidth="3" />
          <circle cx="4" cy="4" r="3" fill="#ec4899" />
          <circle cx="24" cy="4" r="3" fill="#ec4899" />
          <circle cx="4" cy="24" r="3" fill="#ec4899" />
          <circle cx="24" cy="24" r="3" fill="#ec4899" />
        </svg>
      )
    case 'minimal':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
          <rect x="2" y="2" width="24" height="24" rx="2" fill="currentColor" opacity="0.1" />
          <polyline points="2,8 2,2 8,2" fill="none" stroke="#6366f1" strokeWidth="2.5" />
          <polyline points="20,2 26,2 26,8" fill="none" stroke="#6366f1" strokeWidth="2.5" />
          <polyline points="2,20 2,26 8,26" fill="none" stroke="#6366f1" strokeWidth="2.5" />
          <polyline points="20,26 26,26 26,20" fill="none" stroke="#6366f1" strokeWidth="2.5" />
        </svg>
      )
    case 'dark':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
          <rect x="0" y="0" width="28" height="28" rx="2" fill="#111827" />
          <rect x="4" y="4" width="20" height="20" rx="1" fill="currentColor" opacity="0.2" />
          <rect x="4" y="4" width="20" height="20" rx="1" fill="none" stroke="#f59e0b" strokeWidth="1" />
        </svg>
      )
    default:
      return null
  }
}
