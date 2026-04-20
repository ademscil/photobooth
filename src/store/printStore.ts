'use client'

import { create } from 'zustand'

export interface PrintOrder {
  sessionIndex: number
  templateId: string
  quantity: number
  pricePerPrint: number
}

interface PrintState {
  orders: PrintOrder[]
  addOrder: (order: PrintOrder) => void
  removeOrder: (index: number) => void
  updateQuantity: (index: number, qty: number) => void
  getTotalPrice: () => number
  reset: () => void
}

export const usePrintStore = create<PrintState>()((set, get) => ({
  orders: [],

  addOrder: (order) => set((s) => ({ orders: [...s.orders, order] })),

  removeOrder: (index) => set((s) => ({
    orders: s.orders.filter((_, i) => i !== index),
  })),

  updateQuantity: (index, qty) => set((s) => ({
    orders: s.orders.map((o, i) => i === index ? { ...o, quantity: Math.max(0, qty) } : o),
  })),

  getTotalPrice: () => {
    return get().orders.reduce((sum, o) => sum + o.quantity * o.pricePerPrint, 0)
  },

  reset: () => set({ orders: [] }),
}))
