import { NextRequest, NextResponse } from 'next/server'
import { recordOrderStatus, type OrderStatus } from '@/lib/server/orderStore'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require('midtrans-client')

/**
 * POST /api/payment/notification
 * Midtrans webhook — receives payment status notifications.
 * Configure this URL in Midtrans dashboard → Settings → Payment → Notification URL
 *
 * Authenticity is verified by re-fetching the transaction from Midtrans via
 * `coreApi.transaction.notification`. The resolved status is persisted so the
 * webhook acts as the source of truth; repeated events are idempotent.
 */
export async function POST(req: NextRequest) {
  try {
    const notification = await req.json()

    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
    }

    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'

    const coreApi = new midtransClient.CoreApi({
      isProduction,
      serverKey,
    })

    // Verify notification authenticity with Midtrans
    const statusResponse = await coreApi.transaction.notification(notification)

    const orderId = statusResponse.order_id
    const transactionStatus = statusResponse.transaction_status
    const fraudStatus = statusResponse.fraud_status

    let resolved: OrderStatus = 'pending'
    if (transactionStatus === 'capture') {
      resolved = fraudStatus === 'accept' ? 'paid' : 'pending'
    } else if (transactionStatus === 'settlement') {
      resolved = 'paid'
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      resolved = transactionStatus
    } else if (transactionStatus === 'pending') {
      resolved = 'pending'
    }

    // Idempotent: terminal states are not overwritten by late/duplicate events.
    recordOrderStatus(orderId, resolved)

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Midtrans notification error:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'Notification processing failed' }, { status: 500 })
  }
}
