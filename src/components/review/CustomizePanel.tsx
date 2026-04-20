'use client'

import type { FilterId, FrameStyle } from '@/types'
import { FilterSelector } from '@/components/booth/FilterSelector'
import { FrameStyleSelector } from '@/components/booth/FrameStyleSelector'

interface CustomizePanelProps {
  frameEnabled: boolean
  onFrameToggle: (enabled: boolean) => void
  labelText: string
  onLabelChange: (text: string) => void
  filter: FilterId
  onFilterChange: (id: FilterId) => void
  frameStyle: FrameStyle
  onFrameStyleChange: (style: FrameStyle) => void
}

export function CustomizePanel({
  frameEnabled,
  onFrameToggle,
  labelText,
  onLabelChange,
  filter,
  onFilterChange,
  frameStyle,
  onFrameStyleChange,
}: CustomizePanelProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4">
      <h3 className="text-sm font-semibold text-foreground">Customize</h3>

      {/* Frame border toggle */}
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="frame-toggle"
          className="text-sm font-medium text-foreground"
        >
          Frame border
        </label>
        <button
          id="frame-toggle"
          type="button"
          role="switch"
          aria-checked={frameEnabled}
          onClick={() => onFrameToggle(!frameEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
            frameEnabled ? 'bg-brand-primary' : 'bg-neutral-300 dark:bg-neutral-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              frameEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
          <span className="sr-only">{frameEnabled ? 'Disable' : 'Enable'} frame border</span>
        </button>
      </div>

      {/* Label text input */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="label-input"
          className="text-sm font-medium text-foreground"
        >
          Label text
        </label>
        <input
          id="label-input"
          type="text"
          value={labelText}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder="Add a caption…"
          maxLength={80}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* Filter selector */}
      <FilterSelector value={filter} onChange={onFilterChange} />

      {/* Frame style selector */}
      <FrameStyleSelector value={frameStyle} onChange={onFrameStyleChange} />
    </div>
  )
}
