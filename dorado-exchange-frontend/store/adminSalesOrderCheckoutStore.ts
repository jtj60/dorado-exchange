import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AdminSalesOrderCheckout, SalesOrderCheckout, salesOrderServiceOptions } from '@/types/sales-orders'
import { emptyAddress } from '@/types/address'

type PartialAdminCheckout = Partial<AdminSalesOrderCheckout>

interface AdminSalesOrderCheckoutState {
  data: PartialAdminCheckout
  setData: (values: PartialAdminCheckout) => void
  updateField: <K extends keyof SalesOrderCheckout>(key: K, value: AdminSalesOrderCheckout[K]) => void
  clear: () => void
}

export const useAdminSalesOrderCheckoutStore = create<AdminSalesOrderCheckoutState>()(
  persist(
    (set) => ({
      data: {
        address: emptyAddress,
        service: salesOrderServiceOptions.STANDARD,
        using_funds: true,
        payment_method: 'CARD',
      },
      setData: (values) => set((state) => ({ data: { ...state.data, ...values } })),
      updateField: (key, value) =>
        set((state) => ({
          data: {
            ...state.data,
            [key]: value,
          },
        })),
      clear: () =>
        set({
          data: {
            address: emptyAddress,
            service: salesOrderServiceOptions.STANDARD,
            using_funds: true,
            payment_method: 'CARD',
          },
        }),
    }),
    {
      name: 'admin-sales-order-checkout',
    }
  )
)
