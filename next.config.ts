import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

// Midtrans Snap endpoints (sandbox + production).
const MIDTRANS_APP = 'https://app.sandbox.midtrans.com https://app.midtrans.com'
const MIDTRANS_API = 'https://api.sandbox.midtrans.com https://api.midtrans.com'
// Assets rendered inside the Snap popup for e-wallet / QRIS (GoPay, etc.).
const MIDTRANS_ASSETS = 'https://pay.google.com'
const CLOUDINARY = 'https://api.cloudinary.com https://res.cloudinary.com'

/**
 * Content Security Policy.
 *
 * `'unsafe-eval'` is only added in development — React/Next use eval for dev
 * tooling (error overlays, fast refresh), which is what produces the "eval"
 * CSP warning locally. It is NOT included in production builds.
 *
 * `'unsafe-inline'` for scripts/styles is required by the Midtrans Snap popup,
 * which injects inline code we do not control. The remaining Snap warnings in
 * the console ("deprecated feature", "lazy image dimensions") originate inside
 * Midtrans' own bundle and cannot be resolved from this app.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} ${MIDTRANS_APP}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https: ${MIDTRANS_APP} ${MIDTRANS_ASSETS}`,
  "media-src 'self' blob:",
  `connect-src 'self' ${MIDTRANS_API} ${MIDTRANS_APP} ${CLOUDINARY}`,
  `frame-src 'self' ${MIDTRANS_APP}`,
  "worker-src 'self' blob:",
  `font-src 'self' data: ${MIDTRANS_APP}`,
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=()' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

export default nextConfig
