import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/utils/axiosInstance'
import { Address } from '@/types/address'
import { useGetSession } from './useAuth'
import { PurchaseOrder, PurchaseOrderCheckout } from '@/types/purchase-order'

export const usePurchaseOrders = () => {
  const { user } = useGetSession()

  return useQuery<PurchaseOrder[]>({
    queryKey: ['purchase_orders', user],
    queryFn: async () => {
      if (!user?.id) return []
      return await apiRequest<PurchaseOrder[]>('GET', '/purchase_orders/get_purchase_orders', undefined, {
        user_id: user.id,
      })
    },
    enabled: !!user,
  })
}

export const useCreatePurchaseOrder = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (purchase_order: PurchaseOrderCheckout) => {
      if (!user?.id) throw new Error('User is not authenticated')
      return await apiRequest<PurchaseOrderCheckout>('POST', '/purchase_orders/create_purchase_order', {
        user_id: user.id,
        purchase_order: purchase_order,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders', user], refetchType: 'active' })
    },
  })
}