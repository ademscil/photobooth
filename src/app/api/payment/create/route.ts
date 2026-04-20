import { NextRequest, NextResponse } from 'next/server'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require('midtrans-client')

export async function POST(req: NextRequest) {
  try {
    const { orderId, amount, customerName = 'Photobooth Customer' } = await req.json()

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'orderId and amount are required' }, { status: 400 })
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      return NextResponse.json({ error: 'MIDTRANS_SERVER_KEY not configured' }, { status: 500 })
    }

    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'

    const snap = new midtransClient.Snap({ isProduction, serverKey })

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Number(amount),
      },
      customer_details: {
        first_name: customerName,
      },
      // Show all available payment methods — Midtrans will show what's enabled
      // for this merchant account. QRIS will appear if enabled in dashboard.
      callbacks: {
        finish: `${req.nextUrl.origin}/booth`,
      },
    }

    const transaction = await snap.createTransaction(parameter)

    return NextResponse.json({
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      orderId,
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[payment/create] error:', errMsg)
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
