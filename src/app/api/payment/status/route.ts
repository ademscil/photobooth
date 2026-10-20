import { NextRequest, NextResponse } from 'next/server'
import { recordOrderStatus } from '@/lib/server/orderStore'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require('midtrans-client')

/**
 * GET /api/payment/status?orderId=xxx
 * Checks the payment status of a Midtrans transaction.
 */
export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
    }

    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'

    const coreApi = new midtransClient.CoreApi({
      isProduction,
      serverKey,
    })

    const statusResponse = await coreApi.transaction.status(orderId)

    // Midtrans transaction status codes:
    // settlement / capture = paid
    // pending = waiting for payment
    // deny / cancel / expire = failed
    const isPaid =
      statusResponse.transaction_status === 'settlement' ||
      statusResponse.transaction_status === 'capture'

    const isPending = statusResponse.transaction_status === 'pending'

    // Keep the server order store in sync with verified Midtrans state.
    if (isPaid) {
      recordOrderStatus(orderId, 'paid')
    } else if (isPending) {
      recordOrderStatus(orderId, 'pending')
    } else if (
      statusResponse.transaction_status === 'cancel' ||
      statusResponse.transaction_status === 'deny' ||
      statusResponse.transaction_status === 'expire'
    ) {
      recordOrderStatus(orderId, statusResponse.transaction_status)
    }

    return NextResponse.json({
      orderId,
      status: statusResponse.transaction_status,
      isPaid,
      isPending,
      amount: statusResponse.gross_amount,
    })
  } catch (error) {
    console.error('Midtrans status check error:', error)
    return NextResponse.json({ error: 'Failed to check payment status' }, { status: 500 })
  }
}
