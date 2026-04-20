'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { VideoDevice } from '@/lib/camera/useDevices'

interface CameraDevicePickerProps {
  /** All available browser-visible video input devices. */
  devices: VideoDevice[]
  /** The currently selected deviceId, or null if none selected. */
  selectedDeviceId: string | null
  /** Called when the user selects a different device. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelect: (deviceId: string, eventDetails?: any) => void
  /**
   * When true, the picker is disabled (e.g. during an active capture sequence).
   * Defaults to false.
   */
  disabled?: boolean
}

/**
 * Camera source selector dropdown.
 *
 * - Hidden when only one device is available (no choice to make).
 * - Shows "No cameras found" state with setup guidance when device list is empty.
 * - Displays generic labels ("Camera 1") before permission is granted,
 *   real labels after.
 * - Disabled during active capture to prevent mid-session device switching.
 */
export function CameraDevicePicker({
  devices,
  selectedDeviceId,
  onSelect,
  disabled = false,
}: CameraDevicePickerProps) {
  // No cameras found — show contextual help
  if (devices.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        <span>
          No cameras found.{' '}
          <a
            href="https://support.google.com/chrome/answer/2693767"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:no-underline"
          >
            Check camera access
          </a>{' '}
          or connect a camera.
        </span>
      </div>
    )
  }

  // Single device — no picker needed, render nothing
  if (devices.length === 1) {
    return null
  }

  // Multiple devices — show selector
  const currentValue = selectedDeviceId ?? devices[0]?.deviceId ?? ''

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="camera-device-picker"
        className="text-xs font-medium text-muted-foreground"
      >
        Camera source
      </label>
      <Select
        value={currentValue}
        onValueChange={(val, eventDetails) => { if (val) onSelect(val, eventDetails) }}
        disabled={disabled}
      >
        <SelectTrigger
          id="camera-device-picker"
          aria-label="Select camera source"
          className="w-full"
        >
          <SelectValue placeholder="Select a camera" />
        </SelectTrigger>
        <SelectContent>
          {devices.map((device) => (
            <SelectItem key={device.deviceId} value={device.deviceId}>
              {device.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
