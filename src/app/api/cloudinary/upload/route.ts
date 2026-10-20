import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getClientIp, rateLimit } from '@/lib/server/rateLimit'

/**
 * POST /api/cloudinary/upload
 * Server-side signed upload to Cloudinary.
 * More reliable than unsigned upload from browser.
 * Body: { dataUrl: string, folder: string, filename: string }
 */

// Cap uploads to ~12MB of base64 payload and limit request rate per IP.
const MAX_DATA_URL_LENGTH = 12 * 1024 * 1024
const MAX_UPLOADS = 20
const WINDOW_MS = 60_000

/** Strip anything that is not a safe path segment to avoid traversal in public_id. */
function sanitizeSegment(value: string, fallback: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/\.{2,}/g, '').replace(/\/+/g, '/')
  return cleaned.replace(/^\/+|\/+$/g, '') || fallback
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const limit = rateLimit(`cloudinary:${ip}`, MAX_UPLOADS, WINDOW_MS)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak upload. Coba lagi sebentar.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
      )
    }

    const body = await req.json().catch(() => ({}))
    const { dataUrl, folder = 'photobooth', filename = 'photo' } = body as {
      dataUrl?: string
      folder?: string
      filename?: string
    }

    // Validate payload: must be an image data URL within the size cap.
    if (typeof dataUrl !== 'string' || !/^data:image\/(png|jpeg|jpg|webp);base64,/.test(dataUrl)) {
      return NextResponse.json({ error: 'Invalid image payload' }, { status: 400 })
    }
    if (dataUrl.length > MAX_DATA_URL_LENGTH) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 })
    }

    const safeFolder = sanitizeSegment(String(folder), 'photobooth')
    const safeFilename = sanitizeSegment(String(filename), 'photo')

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    // If no API key/secret, fall back to unsigned upload instruction
    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary API credentials not configured on server' },
        { status: 500 },
      )
    }

    if (!cloudName) {
      return NextResponse.json({ error: 'Cloudinary cloud name not configured' }, { status: 500 })
    }

    const timestamp = Math.round(Date.now() / 1000)
    const publicId = `${safeFolder}/${safeFilename}-${timestamp}`

    // Generate signature
    const signatureString = `folder=${safeFolder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex')

    const formData = new FormData()
    formData.append('file', dataUrl)
    formData.append('api_key', apiKey)
    formData.append('timestamp', String(timestamp))
    formData.append('signature', signature)
    formData.append('folder', safeFolder)
    formData.append('public_id', publicId)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData },
    )

    const data = await res.json()

    if (!res.ok || data.error) {
      console.error('[cloudinary/upload] Error:', data.error)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    return NextResponse.json({
      secureUrl: data.secure_url,
      publicId: data.public_id,
      downloadUrl: data.secure_url.replace('/upload/', '/upload/fl_attachment/'),
    })
  } catch (error) {
    console.error('[cloudinary/upload] Exception:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
