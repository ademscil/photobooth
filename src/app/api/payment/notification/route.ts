import { NextRequest, NextResponse } from 'next/server'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require('midtrans-client')

/**
 * POST /api/payment/notification
 * Midtrans webhook — receives payment status notifications.
 * Configure this URL in Midtrans dashboard → Settings → Payment → Notification URL
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

    console.log(`Payment notification: orderId=${orderId} status=${transactionStatus}`)

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        console.log(`Order ${orderId}: payment captured and accepted`)
      }
    } else if (transactionStatus === 'settlement') {
      console.log(`Order ${orderId}: payment settled`)
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      console.log(`Order ${orderId}: payment ${transactionStatus}`)
    } else if (transactionStatus === 'pending') {
      console.log(`Order ${orderId}: payment pending`)
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Midtrans notification error:', error)
    return NextResponse.json({ error: 'Notification processing failed' }, { status: 500 })
  }
}
