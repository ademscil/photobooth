import { describe, expect, it } from 'vitest'
import { decodePhotosParam, type SessionPhoto } from '@/lib/export/downloadLink'

/** Mirror of the module's internal base64 encoder for building fixtures. */
function encode(photos: unknown): string {
  const json = JSON.stringify(photos)
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

describe('decodePhotosParam', () => {
  it('round-trips valid https Cloudinary photos', () => {
    const photos: SessionPhoto[] = [
      {
        label: 'Foto Template',
        url: 'https://res.cloudinary.com/demo/image/upload/a.jpg',
        downloadUrl: 'https://res.cloudinary.com/demo/image/upload/fl_attachment/a.jpg',
        isCloudinary: true,
      },
    ]
    const decoded = decodePhotosParam(encode(photos))
    expect(decoded).toEqual(photos)
  })

  it('preserves unicode labels', () => {
    const photos: SessionPhoto[] = [
      {
        label: 'Foto 📷 Spesial',
        url: 'https://res.cloudinary.com/demo/x.jpg',
        downloadUrl: 'https://res.cloudinary.com/demo/x.jpg',
        isCloudinary: true,
      },
    ]
    expect(decodePhotosParam(encode(photos))?.[0].label).toBe('Foto 📷 Spesial')
  })

  it('rejects javascript: and data: URLs (XSS hardening)', () => {
    const malicious = [
      { label: 'x', url: 'javascript:alert(1)', downloadUrl: 'javascript:alert(1)', isCloudinary: true },
    ]
    expect(decodePhotosParam(encode(malicious))).toBeNull()

    const dataUrl = [
      { label: 'x', url: 'data:text/html,<script>alert(1)</script>', downloadUrl: 'https://res.cloudinary.com/a.jpg', isCloudinary: true },
    ]
    expect(decodePhotosParam(encode(dataUrl))).toBeNull()
  })

  it('returns null for malformed or non-array payloads', () => {
    expect(decodePhotosParam('@@not-base64@@')).toBeNull()
    expect(decodePhotosParam(encode({ not: 'an array' }))).toBeNull()
    expect(decodePhotosParam(encode([{ label: 'x' }]))).toBeNull()
  })
})
