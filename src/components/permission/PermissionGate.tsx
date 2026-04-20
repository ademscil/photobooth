'use client'

import type { CameraError } from '@/types'
import type { CameraStatus } from '@/lib/camera/useCamera'
import { PermissionRequest } from './PermissionRequest'
import { PermissionDenied } from './PermissionDenied'
import { NoCameraError } from '@/components/errors/NoCameraError'
import { UnsupportedBrowser } from '@/components/errors/UnsupportedBrowser'
import { StreamInterrupted } from '@/components/errors/StreamInterrupted'
import { DeviceDisconnected } from '@/components/errors/DeviceDisconnected'

interface PermissionGateProps {
  cameraError: CameraError | null
  status: CameraStatus
  onRequestPermission: () => void
  onRetry: () => void
  children: React.ReactNode
}

export function PermissionGate({
  cameraError,
  status,
  onRequestPermission,
  onRetry,
  children,
}: PermissionGateProps) {
  // Error states take priority over status
  if (cameraError) {
    switch (cameraError.type) {
      case 'permission-denied':
      case 'permission-dismissed':
        return <PermissionDenied onRetry={onRetry} />

      case 'no-device':
      case 'device-in-use':
        return <NoCameraError onRetry={onRetry} />

      case 'not-supported':
      case 'insecure-context':
        return <UnsupportedBrowser />

      case 'stream-interrupted':
        return <StreamInterrupted onReconnect={onRetry} />

      case 'device-disconnected':
        return <DeviceDisconnected onReconnect={onRetry} />

      default:
        return <NoCameraError onRetry={onRetry} />
    }
  }

  if (status === 'idle') {
    return <PermissionRequest onRequestPermission={onRequestPermission} />
  }

  if (status === 'requesting') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"
          role="status"
          aria-label="Requesting camera access"
        />
        <p className="text-sm text-muted-foreground">Requesting camera access…</p>
      </div>
    )
  }

  if (status === 'active') {
    return <>{children}</>
  }

  // stopped or other — show permission request again
  return <PermissionRequest onRequestPermission={onRequestPermission} />
}
