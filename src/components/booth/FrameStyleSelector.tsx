'use client'

import type { FrameStyle } from '@/lib/composition/frameTemplates'
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
        </svg>
      )
    case 'classic':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
          <rect x="2" y="2" width="24" height="24" rx="2" fill="currentColor" opacity="0.15" />
          <rect x="2" y="2" width="24" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
          <rect x="5" y="5" width="18" height="18" rx="1" fill="none" stroke="white" strokeWidth="2" />
        </svg>
      )
    case 'film':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
          <rect x="0" y="0" width="28" height="28" rx="2" fill="currentColor" opacity="0.15" />
          <rect x="0" y="0" width="6" height="28" fill="currentColor" opacity="0.6" />
          <rect x="22" y="0" width="6" height="28" fill="currentColor" opacity="0.6" />
          <rect x="1" y="4" width="4" height="3" rx="1" fill="white" />
          <rect x="1" y="11" width="4" height="3" rx="1" fill="white" />
          <rect x="1" y="18" width="4" height="3" rx="1" fill="white" />
          <rect x="23" y="4" width="4" height="3" rx="1" fill="white" />
          <rect x="23" y="11" width="4" height="3" rx="1" fill="white" />
          <rect x="23" y="18" width="4" height="3" rx="1" fill="white" />
        </svg>
      )
    case 'polaroid':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
          <rect x="2" y="2" width="24" height="24" rx="1" fill="white" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
          <rect x="4" y="4" width="20" height="15" rx="1" fill="currentColor" opacity="0.2" />
          <rect x="4" y="21" width="20" height="4" rx="0" fill="white" />
        </svg>
      )
    case 'modern':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
          <rect x="2" y="2" width="24" height="24" rx="2" fill="currentColor" opacity="0.1" />
          <rect x="2" y="2" width="24" height="24" rx="2" fill="none" stroke="url(#grad)" strokeWidth="3" />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      )
    case 'vintage':
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true">
          <rect x="2" y="2" width="24" height="24" rx="1" fill="currentColor" opacity="0.1" />
          <rect x="2" y="2" width="24" height="24" rx="1" fill="none" stroke="#92400e" strokeWidth="2" />
          <rect x="5" y="5" width="18" height="18" rx="1" fill="none" stroke="#92400e" strokeWidth="1" />
          <circle cx="3.5" cy="3.5" r="2" fill="#92400e" />
          <circle cx="24.5" cy="3.5" r="2" fill="#92400e" />
          <circle cx="3.5" cy="24.5" r="2" fill="#92400e" />
          <circle cx="24.5" cy="24.5" r="2" fill="#92400e" />
        </svg>
      )
    default:
      return null
  }
}
