/**
 * Cloudinary upload utilities.
 * Uses unsigned upload preset — no API key needed in browser.
 * Photos are uploaded directly from the browser to Cloudinary.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

export interface CloudinaryUploadResult {
  publicId: string
  secureUrl: string
  /** Direct download URL */
  downloadUrl: string
}

/**
 * Uploads a canvas element to Cloudinary as a PNG.
 * Returns the secure URL and public ID.
 */
export async function uploadCanvasToCloudinary(
  canvas: HTMLCanvasElement,
  folder = 'photobooth',
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.')
  }

  // Convert canvas to blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b)
      else reject(new Error('Failed to convert canvas to blob'))
    }, 'image/jpeg', 0.92)
  })

  const formData = new FormData()
  formData.append('file', blob, 'photo.jpg')
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData },
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Cloudinary upload failed: ${res.status}`)
  }

  const data = await res.json()

  return {
    publicId: data.public_id,
    secureUrl: data.secure_url,
    // fl_attachment forces download instead of preview
    downloadUrl: data.secure_url.replace('/upload/', '/upload/fl_attachment/'),
  }
}

/**
 * Uploads an ImageData frame to Cloudinary.
 */
export async function uploadImageDataToCloudinary(
  imageData: ImageData,
  folder = 'photobooth/originals',
): Promise<CloudinaryUploadResult> {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')!
  ctx.putImageData(imageData, 0, 0)
  return uploadCanvasToCloudinary(canvas, folder)
}

/** Check if Cloudinary is configured */
export function isCloudinaryConfigured(): boolean {
  return !!(CLOUD_NAME && UPLOAD_PRESET)
}
