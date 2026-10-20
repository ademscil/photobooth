/**
 * Cloudinary upload utilities.
 *
 * Strategy:
 * 1. Try server-side signed upload via /api/cloudinary/upload (most reliable)
 * 2. Fall back to unsigned upload directly from browser
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

export interface CloudinaryUploadResult {
  publicId: string
  secureUrl: string
  /** URL with fl_attachment to force download */
  downloadUrl: string
}

/**
 * Uploads a canvas element to Cloudinary.
 * Tries server-side signed upload first, falls back to unsigned browser upload.
 */
export async function uploadCanvasToCloudinary(
  canvas: HTMLCanvasElement,
  folder = 'photobooth',
  filename = 'photo',
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not configured')
  }

  // Convert canvas to data URL (JPEG for smaller size)
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92)

  // Try server-side signed upload first (more reliable, bypasses CORS issues)
  try {
    const res = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, folder, filename }),
    })

    if (res.ok) {
      const data = await res.json()
      if (data.secureUrl) {
        console.log('[Cloudinary] Server-side upload success:', data.secureUrl)
        return {
          publicId: data.publicId,
          secureUrl: data.secureUrl,
          downloadUrl: data.downloadUrl,
        }
      }
    }
    // Server upload failed — fall through to unsigned upload
    console.warn('[Cloudinary] Server-side upload failed, trying unsigned...')
  } catch (err) {
    console.warn('[Cloudinary] Server-side upload error:', err)
  }

  // Fall back to unsigned upload from browser
  if (!UPLOAD_PRESET) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET not configured')
  }

  return uploadUnsigned(dataUrl, folder, filename)
}

async function uploadUnsigned(
  dataUrl: string,
  folder: string,
  filename: string,
): Promise<CloudinaryUploadResult> {
  const formData = new FormData()
  formData.append('file', dataUrl)
  formData.append('upload_preset', UPLOAD_PRESET!)
  formData.append('folder', folder)
  formData.append('public_id', `${filename}-${Date.now()}`)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData },
  )

  const data = await res.json()

  if (!res.ok || data.error) {
    const msg = data.error?.message ?? `Upload failed: ${res.status}`
    console.error('[Cloudinary] Unsigned upload error:', msg)
    throw new Error(msg)
  }

  console.log('[Cloudinary] Unsigned upload success:', data.secure_url)

  return {
    publicId: data.public_id,
    secureUrl: data.secure_url,
    downloadUrl: data.secure_url.replace('/upload/', '/upload/fl_attachment/'),
  }
}

/**
 * Uploads an ImageData frame to Cloudinary.
 */
export async function uploadImageDataToCloudinary(
  imageData: ImageData,
  folder = 'photobooth/originals',
  filename = 'original',
): Promise<CloudinaryUploadResult> {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')!
  ctx.putImageData(imageData, 0, 0)
  return uploadCanvasToCloudinary(canvas, folder, filename)
}

/** Check if Cloudinary is configured */
export function isCloudinaryConfigured(): boolean {
  return !!CLOUD_NAME
}
