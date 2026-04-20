'use client'

import { useState } from 'react'
import type { CountdownDuration, FilterId, FrameStyle, TemplateId } from '@/types'
import type { VideoDevice } from '@/lib/camera/useDevices'
import { CameraDevicePicker } from './CameraDevicePicker'
import { TemplateSelector } from './TemplateSelector'
import { FilterSelector } from './FilterSelector'
import { CountdownSelector } from './CountdownSelector'
import { FrameStyleSelector } from './FrameStyleSelector'

interface ControlPanelProps {
  // Template
  template: TemplateId
  onTemplateChange: (id: TemplateId) => void
  // Filter
  filter: FilterId
  onFilterChange: (id: FilterId) => void
  // Countdown
  countdown: CountdownDuration
  onCountdownChange: (d: CountdownDuration) => void
  // Devices
  devices: VideoDevice[]
  selectedDeviceId: string | null
  onDeviceSelect: (deviceId: string) => void
  // Frame style
  frameStyle: FrameStyle
  onFrameStyleChange: (style: FrameStyle) => void
  // Disabled state (during capture)
  disabled?: boolean
}

export function ControlPanel({
  template,
  onTemplateChange,
  filter,
  onFilterChange,
  countdown,
  onCountdownChange,
  devices,
  selectedDeviceId,
  onDeviceSelect,
  frameStyle,
  onFrameStyleChange,
  disabled = false,
}: ControlPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const content = (
    <div className="flex flex-col gap-4">
      <CameraDevicePicker
        devices={devices}
        selectedDeviceId={selectedDeviceId}
        onSelect={onDeviceSelect}
        disabled={disabled}
      />
      <TemplateSelector
        value={template}
        onChange={onTemplateChange}
        disabled={disabled}
      />
      <FilterSelector
        value={filter}
        onChange={onFilterChange}
        disabled={disabled}
      />
      <FrameStyleSelector
        value={frameStyle}
        onChange={onFrameStyleChange}
        disabled={disabled}
      />
      <CountdownSelector
        value={countdown}
        onChange={onCountdownChange}
        disabled={disabled}
      />
    </div>
  )

  return (
    <>
      {/* Mobile: collapsible accordion */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="control-panel-content"
          className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span>Settings</span>
          <svg
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div
            id="control-panel-content"
            className="mt-2 rounded-lg border border-border bg-background p-4"
          >
            {content}
          </div>
        )}
      </div>

      {/* Desktop: always visible */}
      <div className="hidden md:block">
        {content}
      </div>
    </>
  )
}
