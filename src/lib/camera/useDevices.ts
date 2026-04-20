'use client'

/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react'

/**
 * A video input device with a resolved label.
 * Before camera permission is granted, `label` will be a generic fallback
 * (e.g. "Camera 1") because the browser hides real labels for privacy.
 */
export interface VideoDevice {
  deviceId: string
  label: string
  /** The raw MediaDeviceInfo from the browser API. */
  raw: MediaDeviceInfo
}

interface UseDevicesResult {
  /** All browser-visible video input devices. */
  devices: VideoDevice[]
  /** True while the initial enumeration is in progress. */
  loading: boolean
  /** Error from enumerateDevices(), or null. */
  error: Error | null
  /** Manually trigger a re-enumeration (e.g. after permission is granted). */
  refresh: () => void
}

/**
 * Enumerates all browser-visible `videoinput` devices.
 *
 * - Returns generic labels ("Camera 1") before camera permission is granted,
 *   because the browser hides real labels until permission is given.
 * - Automatically re-enumerates when devices are added or removed
 *   (`devicechange` event).
 * - Call `refresh()` after permission is granted to get real device labels.
 */
export function useDevices(): UseDevicesResult {
  const [devices, setDevices] = useState<VideoDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  const enumerate = async () => {
    if (!navigator?.mediaDevices?.enumerateDevices) {
      setError(new Error('enumerateDevices not supported'))
      setLoading(false)
      return
    }

    try {
      const all = await navigator.mediaDevices.enumerateDevices()
      const videoInputs = all.filter((d) => d.kind === 'videoinput')

      const resolved: VideoDevice[] = videoInputs.map((d, index) => ({
        deviceId: d.deviceId,
        // Use real label when available; fall back to generic label
        label: d.label || `Camera ${index + 1}`,
        raw: d,
      }))

      if (mountedRef.current) {
        setDevices(resolved)
        setError(null)
        setLoading(false)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    mountedRef.current = true
    void enumerate() // fire-and-forget; setState calls are guarded by mountedRef

    // Re-enumerate when devices are plugged in or removed
    const handler = () => void enumerate()
    navigator?.mediaDevices?.addEventListener?.('devicechange', handler)

    return () => {
      mountedRef.current = false
      navigator?.mediaDevices?.removeEventListener?.('devicechange', handler)
    }
  }, [])

  return { devices, loading, error, refresh: enumerate }
}
