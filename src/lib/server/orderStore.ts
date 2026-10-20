/**
 * In-memory order status store.
 *
 * Records the last known Midtrans status per order so the webhook can act
 * as a source of truth and status checks can short-circuit. Also provides
 * idempotency: a webhook event for an order already in a terminal state is
 * ignored.
 *
 * NOTE: this is process-local. For multi-instance/serverless production,
 * back this with a shared store (Redis/Vercel KV). The interface is kept
 * small so swapping the implementation is straightforward.
 */

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'cancel'
  | 'deny'
  | 'expire'

interface OrderRecord {
  status: OrderStatus
  updatedAt: number
}

const orders = new Map<string, OrderRecord>()

const TERMINAL: ReadonlySet<OrderStatus> = new Set(['paid', 'failed', 'cancel', 'deny', 'expire'])

export function getOrderStatus(orderId: string): OrderStatus | null {
  return orders.get(orderId)?.status ?? null
}

/**
 * Records a status transition. Returns false (no-op) when the order is
 * already in a terminal state — giving idempotent webhook handling.
 */
export function recordOrderStatus(orderId: string, status: OrderStatus): boolean {
  const existing = orders.get(orderId)
  if (existing && TERMINAL.has(existing.status)) {
    return false
  }
  orders.set(orderId, { status, updatedAt: Date.now() })
  return true
}

export function isOrderPaid(orderId: string): boolean {
  return getOrderStatus(orderId) === 'paid'
}
