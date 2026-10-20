import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, rateLimit } from '@/lib/server/rateLimit'

// Allow at most 5 voucher attempts per IP per minute to blunt brute-force.
const MAX_ATTEMPTS = 5
const WINDOW_MS = 60_000

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const limit = rateLimit(`voucher:${ip}`, MAX_ATTEMPTS, WINDOW_MS)
  if (!limit.allowed) {
    return NextResponse.json(
      { valid: false, message: 'Terlalu banyak percobaan. Coba lagi sebentar.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    )
  }

  const body = await request.json().catch(() => ({}))
  const { code } = body as { code?: string; amount?: number }

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ valid: false, message: 'Kode voucher tidak boleh kosong' }, { status: 400 })
  }

  // Fail closed: if no voucher codes are configured, cash vouchers are disabled.
  const rawCodes = process.env.VOUCHER_CODES
  if (!rawCodes || !rawCodes.trim()) {
    return NextResponse.json(
      { valid: false, message: 'Pembayaran voucher belum diaktifkan' },
      { status: 200 },
    )
  }

  const validCodes = rawCodes.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean)
  const isValid = validCodes.includes(code.trim().toUpperCase())

  if (isValid) {
    return NextResponse.json({ valid: true, message: 'Kode voucher valid' })
  }
  return NextResponse.json({ valid: false, message: 'Kode voucher tidak valid atau sudah digunakan' }, { status: 200 })
}
