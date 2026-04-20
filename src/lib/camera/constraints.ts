import type { CameraError } from '@/types'

/**
 * Builds a `MediaStreamConstraints` object for `getUserMedia`.
 *
 * - When a `deviceId` is provided, requests that specific device with
 *   `{ exact: deviceId }` to avoid falling back to a different camera.
 * - Requests up to 1920×1080 resolution; the browser will fall back to
 *   the highest available resolution if the device cannot satisfy the ideal.
 * - When no `deviceId` is provided, falls back to `{ video: true }`.
 */
export function buildConstraints(deviceId: string | null): MediaStreamConstraints {
  const videoConstraints: MediaTrackConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  }

  if (deviceId) {
    videoConstraints.deviceId = { exact: deviceId }
  }

  return { video: videoConstraints, audio: false }
}

/**
 * Maps a `getUserMedia` error to a typed `CameraError` discriminated union.
 *
 * Browser error names vary slightly across vendors; this function normalises
 * all known variants to a consistent internal type.
 */
export function mapGetUserMediaError(err: unknown): CameraError {
  if (!(err instanceof Error)) {
    return { type: 'unknown', message: String(err) }
  }

  switch (err.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return { type: 'permission-denied' }

    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return { type: 'no-device' }

    case 'NotReadableError':
    case 'TrackStartError':
      return { type: 'device-in-use' }

    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      // Overconstrained usually means the exact deviceId is no longer valid
      return { type: 'no-device' }

    case 'TypeError':
      // Thrown when constraints are malformed — treat as unknown
      return { type: 'unknown', message: err.message }

    default:
      return { type: 'unknown', message: err.message }
  }
}
