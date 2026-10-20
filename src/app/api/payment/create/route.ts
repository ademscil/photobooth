import { NextRequest, NextResponse } from 'next/server'
import { getServerPackage } from '@/lib/payment/packages'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require('midtrans-client')

/** Order ids are generated client-side as PHOTO-<timestamp>-<rand>. */
const ORDER_ID_PATTERN = /^PHOTO-\d+-[A-Z0-9]{4,12}$/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { orderId, packageId, customerName = 'Photobooth Customer' } = body as {
      orderId?: string
      packageId?: string
      customerName?: string
    }

    if (!orderId || !ORDER_ID_PATTERN.test(orderId)) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })
    }

    // The amount is derived server-side from the package id. The client is
    // never trusted to specify the price it will be charged.
    const pkg = getServerPackage(packageId ?? '')
    if (!pkg) {
      return NextResponse.json({ error: 'Unknown package' }, { status: 400 })
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
    }

    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'

    const snap = new midtransClient.Snap({ isProduction, serverKey })

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: pkg.price,
      },
      item_details: [
        {
          id: pkg.id,
          name: `Photobooth ${pkg.name}`,
          price: pkg.price,
          quantity: 1,
        },
      ],
      customer_details: {
        first_name: String(customerName).slice(0, 60),
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
      amount: pkg.price,
    })
  } catch (error) {
    // Log details server-side only; return a generic message to the client.
    const rawMessage = error instanceof Error ? error.message : String(error)
    // Midtrans client errors carry the gateway's JSON response in ApiResponse.
    const apiResponse = (error as { ApiResponse?: unknown })?.ApiResponse
    const httpStatusCode = (error as { httpStatusCode?: unknown })?.httpStatusCode
    console.error('[payment/create] error:', rawMessage, apiResponse ?? '')

    // In sandbox/dev, surface the real cause so misconfiguration is debuggable.
    // In production (live merchant) the message stays generic.
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
    if (!isProduction) {
      return NextResponse.json(
        {
          error: 'Gagal membuat transaksi',
          debug: {
            midtransMessage: rawMessage,
            httpStatusCode: httpStatusCode ?? null,
            apiResponse: apiResponse ?? null,
            serverKeyPresent: Boolean(process.env.MIDTRANS_SERVER_KEY),
            serverKeyPrefix: process.env.MIDTRANS_SERVER_KEY?.slice(0, 11) ?? null,
            isProductionFlag: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION ?? null,
          },
        },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: 'Gagal membuat transaksi' }, { status: 500 })
  }
}
