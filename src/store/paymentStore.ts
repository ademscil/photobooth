'use client'

import { create } from 'zustand'

export type PaymentStatus = 'idle' | 'creating' | 'pending' | 'paid' | 'failed'
export type PaymentMethod = 'qris' | 'cash'

export interface PricingPackage {
  id: 'basic' | 'premium'
  name: string
  price: number
  templateCount: number   // how many templates can be downloaded/printed
  sessionCount: number    // always 2
  sessionDuration: number // minutes per session
  description: string
  features: string[]
}

export interface SessionResult {
  sessionNumber: number
  templateId: string
  templateName: string
  canDownload: boolean  // based on package templateCount
}

export const PRICING_PACKAGES: PricingPackage[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 15000,
    templateCount: 1,   // 1 template bisa didownload/cetak
    sessionCount: 2,
    sessionDuration: 5,
    description: '2 sesi foto, cetak 1 template',
    features: [
      '2 sesi foto (@ 5 menit)',
      'Pilih 2 template berbeda',
      'Cetak 1 template pilihan (4R)',
      'Soft file semua sesi dikirim',
      'Semua filter tersedia',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 25000,
    templateCount: 2,   // 2 template bisa didownload/cetak
    sessionCount: 2,
    sessionDuration: 5,
    description: '2 sesi foto, cetak 2 template',
    features: [
      '2 sesi foto (@ 5 menit)',
      'Pilih 2 template berbeda',
      'Cetak 2 template (4R)',
      'Soft file semua sesi dikirim',
      'Semua filter tersedia',
      'Custom template (upload frame)',
    ],
  },
]

interface PaymentState {
  status: PaymentStatus
  paymentMethod: PaymentMethod
  orderId: string | null
  snapToken: string | null
  selectedPackage: PricingPackage | null
  amount: number
  error: string | null

  // Session tracking
  sessionsCompleted: number
  sessionResults: SessionResult[]  // results from each completed session

  setSelectedPackage: (pkg: PricingPackage) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setAmount: (amount: number) => void
  setStatus: (status: PaymentStatus) => void
  setOrderId: (id: string) => void
  setSnapToken: (token: string) => void
  setError: (error: string | null) => void
  addSessionResult: (result: SessionResult) => void
  reset: () => void
}

export function generateOrderId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `PHOTO-${timestamp}-${random}`
}

export const usePaymentStore = create<PaymentState>()((set) => ({
  status: 'idle',
  paymentMethod: 'qris',
  orderId: null,
  snapToken: null,
  selectedPackage: null,
  amount: 15000,
  error: null,
  sessionsCompleted: 0,
  sessionResults: [],

  setSelectedPackage: (pkg) => set({ selectedPackage: pkg, amount: pkg.price }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setAmount: (amount) => set({ amount }),
  setStatus: (status) => set({ status }),
  setOrderId: (orderId) => set({ orderId }),
  setSnapToken: (snapToken) => set({ snapToken }),
  setError: (error) => set({ error }),
  addSessionResult: (result) => set((s) => ({
    sessionsCompleted: s.sessionsCompleted + 1,
    sessionResults: [...s.sessionResults, result],
  })),
  reset: () => set({
    status: 'idle', orderId: null, snapToken: null,
    error: null, sessionsCompleted: 0, sessionResults: [],
    selectedPackage: null, paymentMethod: 'qris',
  }),
}))
