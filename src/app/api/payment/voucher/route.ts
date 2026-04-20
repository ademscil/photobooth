import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { code } = body as { code?: string; amount?: number }

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ valid: false, message: 'Kode voucher tidak boleh kosong' }, { status: 400 })
  }

  const rawCodes = process.env.VOUCHER_CODES ?? 'CASH001,CASH002,EVENT2024'
  const validCodes = rawCodes.split(',').map((c) => c.trim().toUpperCase())
  const isValid = validCodes.includes(code.trim().toUpperCase())

  if (isValid) {
    return NextResponse.json({ valid: true, message: 'Kode voucher valid' })
  }
  return NextResponse.json({ valid: false, message: 'Kode voucher tidak valid atau sudah digunakan' }, { status: 200 })
}
