import type { NextConfig } from 'next'

const MIDTRANS_SANDBOX = 'https://app.sandbox.midtrans.com'
const MIDTRANS_PROD = 'https://app.midtrans.com'
const MIDTRANS_API_SANDBOX = 'https://api.sandbox.midtrans.com'
const MIDTRANS_API_PROD = 'https://api.midtrans.com'
const CLOUDINARY_API = 'https://api.cloudinary.com'
const CLOUDINARY_RES = 'https://res.cloudinary.com'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Allow Midtrans Snap.js (needs unsafe-eval internally)
              `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${MIDTRANS_SANDBOX} ${MIDTRANS_PROD}`,
              "style-src 'self' 'unsafe-inline'",
              // Allow blob: for canvas export, data: for images
              "img-src 'self' data: blob: https:",
              // Allow camera stream
              "media-src 'self' blob:",
              // Allow Midtrans API calls from browser (Snap popup) + Cloudinary uploads
              `connect-src 'self' ${MIDTRANS_API_SANDBOX} ${MIDTRANS_API_PROD} ${MIDTRANS_SANDBOX} ${MIDTRANS_PROD} ${CLOUDINARY_API} ${CLOUDINARY_RES}`,
              // Allow Midtrans Snap iframe
              `frame-src 'self' ${MIDTRANS_SANDBOX} ${MIDTRANS_PROD}`,
              "worker-src 'self' blob:",
              // Allow Midtrans source maps
              `font-src 'self' data: ${MIDTRANS_SANDBOX} ${MIDTRANS_PROD}`,
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
