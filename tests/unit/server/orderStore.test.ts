import { describe, expect, it } from 'vitest'
import { getOrderStatus, isOrderPaid, recordOrderStatus } from '@/lib/server/orderStore'

describe('orderStore', () => {
  it('records and reads back a status', () => {
    const id = `PHOTO-${Date.now()}-AAA1`
    recordOrderStatus(id, 'pending')
    expect(getOrderStatus(id)).toBe('pending')
    expect(isOrderPaid(id)).toBe(false)
  })

  it('transitions pending → paid', () => {
    const id = `PHOTO-${Date.now()}-AAA2`
    recordOrderStatus(id, 'pending')
    expect(recordOrderStatus(id, 'paid')).toBe(true)
    expect(isOrderPaid(id)).toBe(true)
  })

  it('is idempotent once in a terminal state', () => {
    const id = `PHOTO-${Date.now()}-AAA3`
    recordOrderStatus(id, 'paid')
    // A late "expire" event must not overwrite a settled payment.
    expect(recordOrderStatus(id, 'expire')).toBe(false)
    expect(getOrderStatus(id)).toBe('paid')
  })

  it('returns null for unknown orders', () => {
    expect(getOrderStatus('PHOTO-0-NONE')).toBeNull()
  })
})
