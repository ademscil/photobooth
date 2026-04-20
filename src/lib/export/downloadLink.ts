import type { CapturedFrame } from '@/types'
import { uploadCanvasToCloudinary, uploadImageDataToCloudinary, isCloudinaryConfigured } from './cloudinaryUpload'
import { compose } from '@/lib/composition/composer'
import type { CompositionOptions } from '@/types'

const SESSION_KEY_PREFIX = 'photobooth:session:'

export interface SessionPhoto {
  label: string
  url: string          // Cloudinary URL or local data URL
  downloadUrl: string  // Direct download URL
  isCloudinary: boolean
}

export interface SessionDownloadData {
  photos: SessionPhoto[]
  createdAt: number
  /** Legacy: individual frame data URLs (for local fallback) */
  frames?: Array<{ dataUrl: string; timestamp: number; filter: string }>
  composedDataUrl?: string
}

/**
 * Encodes session data as a base64 URL-safe string for embedding in QR URLs.
 * Works in browser without Buffer.
 */
function encodePhotosParam(photos: SessionPhoto[]): string {
  try {
    const json = JSON.stringify(photos)
    // Use encodeURIComponent + btoa to handle Unicode safely
    return btoa(unescape(encodeURIComponent(json)))
  } catch {
    return ''
  }
}

/**
 * Decodes the base64 photos param from a download URL.
 */
export function decodePhotosParam(param: string): SessionPhoto[] | null {
  try {
    const json = decodeURIComponent(escape(atob(param)))
    const parsed = JSON.parse(json)
    if (Array.isArray(parsed)) return parsed as SessionPhoto[]
    return null
  } catch {
    return null
  }
}

/**
 * Uploads all session photos to Cloudinary (if configured) and stores
 * the resulting URLs in sessionStorage AND encodes them in the URL so
 * the download page works on any device (e.g. phone scanning QR code).
 *
 * Falls back to local data URLs if Cloudinary is not configured.
 */
export async function generateSessionDownloadUrl(
  frames: CapturedFrame[],
  compositionOptions?: Omit<CompositionOptions, 'scale'>,
  onProgress?: (step: string) => void,
): Promise<string> {
  const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const storageKey = `${SESSION_KEY_PREFIX}${key}`
  const photos: SessionPhoto[] = []

  if (isCloudinaryConfigured()) {
    // Upload composed template photo
    if (compositionOptions) {
      try {
        onProgress?.('Mengupload foto template...')
        const composed = compose(frames, { ...compositionOptions, scale: 2 })
        const result = await uploadCanvasToCloudinary(composed, 'photobooth/templates')
        photos.push({
          label: 'Foto Template',
          url: result.secureUrl,
          downloadUrl: result.downloadUrl,
          isCloudinary: true,
        })
        console.log('[downloadLink] Template uploaded:', result.secureUrl)
      } catch (err) {
        console.error('[downloadLink] Failed to upload composed photo:', err)
      }
    }

    // Upload original frames
    for (let i = 0; i < frames.length; i++) {
      try {
        onProgress?.(`Mengupload foto original ${i + 1}/${frames.length}...`)
        const result = await uploadImageDataToCloudinary(frames[i].imageData, 'photobooth/originals')
        photos.push({
          label: `Foto Original ${i + 1}`,
          url: result.secureUrl,
          downloadUrl: result.downloadUrl,
          isCloudinary: true,
        })
        console.log(`[downloadLink] Frame ${i + 1} uploaded:`, result.secureUrl)
      } catch (err) {
        console.error(`[downloadLink] Failed to upload frame ${i}:`, err)
      }
    }
  } else {
    // Fallback: store as data URLs in sessionStorage only (too large for URL params)
    onProgress?.('Menyiapkan foto...')

    if (compositionOptions) {
      const composed = compose(frames, { ...compositionOptions, scale: 2 })
      const dataUrl = composed.toDataURL('image/jpeg', 0.9)
      photos.push({
        label: 'Foto Template',
        url: dataUrl,
        downloadUrl: dataUrl,
        isCloudinary: false,
      })
    }

    for (let i = 0; i < frames.length; i++) {
      const canvas = document.createElement('canvas')
      canvas.width = frames[i].imageData.width
      canvas.height = frames[i].imageData.height
      const ctx = canvas.getContext('2d')!
      ctx.putImageData(frames[i].imageData, 0, 0)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      photos.push({
        label: `Foto Original ${i + 1}`,
        url: dataUrl,
        downloadUrl: dataUrl,
        isCloudinary: false,
      })
    }
  }

  const data: SessionDownloadData = { photos, createdAt: Date.now() }

  // Always store in sessionStorage (same-device fallback)
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(data))
  } catch {
    // sessionStorage full — silently ignore
  }

  // For Cloudinary photos: encode URLs in the URL itself so any device can access them
  // Data URLs are too large to encode in URL params, so only do this for Cloudinary
  const cloudinaryPhotos = photos.filter((p) => p.isCloudinary)
  if (cloudinaryPhotos.length > 0) {
    const encoded = encodePhotosParam(cloudinaryPhotos)
    if (encoded) {
      return `/download/${key}?d=${encoded}`
    }
  }

  return `/download/${key}`
}

/** Retrieves session download data from sessionStorage. */
export function getSessionDownloadData(key: string): SessionDownloadData | null {
  try {
    const raw = sessionStorage.getItem(`${SESSION_KEY_PREFIX}${key}`)
    if (!raw) return null
    return JSON.parse(raw) as SessionDownloadData
  } catch {
    return null
  }
}
