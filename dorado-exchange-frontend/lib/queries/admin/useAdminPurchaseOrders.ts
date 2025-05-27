import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/utils/axiosInstance'
import { useGetSession } from '../useAuth'
import { ShipmentTracking } from '@/types/shipping'
import { PurchaseOrder, PurchaseOrderItem } from '@/types/purchase-order'
import { SpotPrice } from '@/types/metal'
import { Product } from '@/types/product'
import { payoutOptions } from '@/types/payout'
import getPurchaseOrderItemPrice from '@/utils/getPurchaseOrderItemPrice'
import getPurchaseOrderTotal from '@/utils/purchaseOrderTotal'

export const useAdminPurchaseOrders = () => {
  const { user } = useGetSession()

  return useQuery<PurchaseOrder[]>({
    queryKey: ['admin_purchase_orders', user],
    queryFn: async () => {
      if (!user?.id) return []
      return await apiRequest<PurchaseOrder[]>(
        'GET',
        '/admin/get_admin_purchase_orders',
        undefined,
        {
          user_id: user.id,
        }
      )
    },
    enabled: !!user,
    refetchInterval: 10000,
  })
}

export const useMovePurchaseOrderStatus = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      order_status,
      order,
      action,
    }: {
      order_status: string
      order: PurchaseOrder
      action: string
    }) => {
      if (!user?.id || user?.role !== 'admin') throw new Error('User is not an admin.')
      await apiRequest('POST', '/admin/change_purchase_order_status', {
        order_status,
        order,
        action,
        user_name: user?.name,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin_purchase_orders', user],
        refetchType: 'active',
      })
    },
  })
}

export const useAdminInTransit = (
  shipment_id: string,
  shipment_start: string,
  shipment_end: string,
  tracking_number: string
) => {
  const { user } = useGetSession()

  return useQuery<ShipmentTracking | null>({
    queryKey: ['admin_inbound_shipment_tracking', shipment_id, user],
    queryFn: async () => {
      if (!user?.id || user?.role !== 'admin') return null
      return await apiRequest<ShipmentTracking>('POST', '/shipping/get_inbound_shipment_tracking', {
        tracking_number,
        shipment_id,
        shipment_end,
        shipment_start,
      })
    },
    enabled: !!user,
  })
}

export const useUpdateOrderScrapPercentage = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      spot,
      scrap_percentage,
    }: {
      spot: SpotPrice
      scrap_percentage: number
    }) => {
      if (!user?.id) throw new Error('User is not authenticated')
      return await apiRequest<SpotPrice>('POST', '/admin/update_purchase_order_scrap_percentage', {
        user_id: user.id,
        spot,
        scrap_percentage,
      })
    },
    onMutate: async ({ spot, scrap_percentage }) => {
      const queryKey = ['purchase_orders_metals', spot.purchase_order_id]
      await queryClient.cancelQueries({ queryKey })
      const previousSpotPrices = queryClient.getQueryData<SpotPrice[]>(queryKey)
      queryClient.setQueryData<SpotPrice[]>(queryKey, (old = []) =>
        old.map((s) => (s.id === spot.id ? { ...s, scrap_percentage } : s))
      )

      return { previousSpotPrices, queryKey }
    },
    onError: (_err, _newData, context) => {
      if (context?.previousSpotPrices && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousSpotPrices)
      }
    },
    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({
          queryKey: context.queryKey,
          refetchType: 'active',
        })
      }
    },
  })
}

export const useResetOrderScrapPercentage = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ spot }: { spot: SpotPrice }) => {
      if (!user?.id) throw new Error('User is not authenticated')

      return await apiRequest<SpotPrice>('POST', '/admin/reset_purchase_order_scrap_percentage', {
        user_id: user.id,
        spot,
      })
    },
    onMutate: async ({ spot }) => {
      const queryKey = ['purchase_orders_metals', spot.purchase_order_id]

      await queryClient.cancelQueries({ queryKey })

      const previousSpotPrices = queryClient.getQueryData<SpotPrice[]>(queryKey)
      const globalSpotPrices = queryClient.getQueryData<SpotPrice[]>(['spot_prices'])

      const globalScrapPercentage = globalSpotPrices?.find(
        (s) => s.type === spot.type
      )?.scrap_percentage

      queryClient.setQueryData<SpotPrice[]>(queryKey, (old = []) =>
        old.map((s) =>
          s.id === spot.id
            ? { ...s, scrap_percentage: globalScrapPercentage ?? s.scrap_percentage }
            : s
        )
      )

      return { previousSpotPrices, queryKey }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousSpotPrices && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousSpotPrices)
      }
    },
    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({
          queryKey: context.queryKey,
          refetchType: 'active',
        })
      }
    },
  })
}

export const useUpdateOrderSpotPrice = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ spot, updated_spot }: { spot: SpotPrice; updated_spot: number }) => {
      if (!user?.id) throw new Error('User is not authenticated')
      return await apiRequest<SpotPrice>('POST', '/admin/update_purchase_order_spot', {
        user_id: user.id,
        spot,
        updated_spot,
      })
    },
    onMutate: async ({ spot, updated_spot }) => {
      const queryKey = ['purchase_orders_metals', spot.purchase_order_id]
      await queryClient.cancelQueries({ queryKey })
      const previousSpotPrices = queryClient.getQueryData<SpotPrice[]>(queryKey)

      queryClient.setQueryData<SpotPrice[]>(queryKey, (old = []) =>
        old.map((s) => (s.id === spot.id ? { ...s, bid_spot: updated_spot } : s))
      )

      return { previousSpotPrices, queryKey }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousSpotPrices && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousSpotPrices)
      }
    },
    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({
          queryKey: context.queryKey,
          refetchType: 'active',
        })
      }
    },
  })
}

export const useLockOrderSpotPrices = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      spots,
      purchase_order_id,
    }: {
      spots: SpotPrice[]
      purchase_order_id: string
    }) => {
      if (!user?.id) throw new Error('User is not authenticated')
      return await apiRequest<SpotPrice[]>('POST', '/admin/lock_purchase_order_spots', {
        user_id: user.id,
        spots,
        purchase_order_id: purchase_order_id,
      })
    },
    onMutate: async ({ spots, purchase_order_id }) => {
      const queryKey = ['purchase_orders_metals', purchase_order_id]

      await queryClient.cancelQueries({ queryKey })
      const previousSpotPrices = queryClient.getQueryData<SpotPrice[]>(queryKey)

      queryClient.setQueryData<SpotPrice[]>(queryKey, (old = []) =>
        old.map((s) => {
          const incoming = spots.find((sp) => sp.id === s.id)
          return incoming ? { ...s, bid_spot: incoming.bid_spot } : s
        })
      )

      const orderQueryKey = ['admin_purchase_orders', user]
      const previousOrders = queryClient.getQueryData<PurchaseOrder[]>(queryKey)

      queryClient.setQueryData<PurchaseOrder[]>(queryKey, (old = []) =>
        old.map((order) =>
          order.id !== purchase_order_id
            ? order
            : {
                ...order,
                spots_locked: true,
              }
        )
      )

      return { previousSpotPrices, previousOrders, queryKey, orderQueryKey }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousSpotPrices && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousSpotPrices)
      }
      if (context?.previousOrders && context.orderQueryKey) {
        queryClient.setQueryData(context.orderQueryKey, context.previousOrders)
      }
    },
    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({
          queryKey: context.queryKey,
          refetchType: 'active',
        })
      }
      if (context?.orderQueryKey) {
        queryClient.invalidateQueries({
          queryKey: context.orderQueryKey,
          refetchType: 'active',
        })
      }
    },
  })
}

export const useResetOrderSpotPrices = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ purchase_order_id }: { purchase_order_id: string }) => {
      if (!user?.id) throw new Error('User is not authenticated')
      return await apiRequest<SpotPrice[]>('POST', '/admin/reset_purchase_order_spots', {
        user_id: user.id,
        purchase_order_id,
      })
    },
    onMutate: async ({ purchase_order_id }) => {
      const queryKey = ['purchase_orders_metals', purchase_order_id]
      await queryClient.cancelQueries({ queryKey })
      const previousSpotPrices = queryClient.getQueryData<SpotPrice[]>(queryKey)

      queryClient.setQueryData<SpotPrice[]>(queryKey, (old = []) =>
        old.map((s) => ({
          ...s,
          bid_spot: null as unknown as number,
        }))
      )

      const orderQueryKey = ['admin_purchase_orders', user]
      const previousOrders = queryClient.getQueryData<PurchaseOrder[]>(queryKey)

      queryClient.setQueryData<PurchaseOrder[]>(queryKey, (old = []) =>
        old.map((order) =>
          order.id !== purchase_order_id
            ? order
            : {
                ...order,
                spots_locked: false,
              }
        )
      )

      return { previousSpotPrices, previousOrders, queryKey, orderQueryKey }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousSpotPrices && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousSpotPrices)
      }
      if (context?.previousOrders && context.orderQueryKey) {
        queryClient.setQueryData(context.orderQueryKey, context.previousOrders)
      }
    },
    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({
          queryKey: context.queryKey,
          refetchType: 'active',
        })
      }
      if (context?.orderQueryKey) {
        queryClient.invalidateQueries({
          queryKey: context.orderQueryKey,
          refetchType: 'active',
        })
      }
    },
  })
}

export const useSaveOrderItems = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      ids,
      purchase_order_id,
    }: {
      ids: string[]
      purchase_order_id: string
    }) => {
      if (!user?.id) throw new Error('Not authenticated')
      return await apiRequest('POST', '/admin/save_order_items', {
        ids,
        purchase_order_id,
      })
    },
    onMutate: async ({ ids, purchase_order_id }) => {
      const queryKey = ['admin_purchase_orders', user]
      await queryClient.cancelQueries({ queryKey })

      const previousOrders = queryClient.getQueryData<PurchaseOrder[]>(queryKey)

      queryClient.setQueryData<PurchaseOrder[]>(queryKey, (old = []) =>
        old.map((order) =>
          order.id !== purchase_order_id
            ? order
            : {
                ...order,
                order_items: order.order_items.map((oi) =>
                  ids.includes(oi.id)
                    ? {
                        ...oi,
                        confirmed: true,
                      }
                    : oi
                ),
              }
        )
      )

      return { previousOrders, queryKey }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousOrders && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousOrders)
      }
    },
    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey, refetchType: 'active' })
      }
    },
  })
}

export const useResetOrderItem = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, purchase_order_id }: { id: string; purchase_order_id: string }) => {
      if (!user?.id) throw new Error('Not authenticated')
      return await apiRequest('POST', '/admin/reset_order_item', {
        id,
        purchase_order_id,
      })
    },
    onMutate: async ({ id, purchase_order_id }) => {
      const queryKey = ['admin_purchase_orders', user]
      await queryClient.cancelQueries({ queryKey })

      const previousOrders = queryClient.getQueryData<PurchaseOrder[]>(queryKey)

      queryClient.setQueryData<PurchaseOrder[]>(queryKey, (old = []) =>
        old.map((order) =>
          order.id !== purchase_order_id
            ? order
            : {
                ...order,
                order_items: order.order_items.map((oi) =>
                  oi.id === id ? { ...oi, confirmed: false } : oi
                ),
              }
        )
      )

      return { previousOrders, queryKey }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousOrders && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousOrders)
      }
    },
    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({
          queryKey: context.queryKey,
          refetchType: 'active',
        })
      }
    },
  })
}

export const useUpdateOrderScrapItem = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: PurchaseOrderItem) => {
      if (!user?.id) throw new Error('Not authenticated')
      return await apiRequest('POST', '/admin/update_order_scrap_item', { item })
    },
    onMutate: async (item) => {
      const queryKey = ['admin_purchase_orders', user]
      await queryClient.cancelQueries({ queryKey })

      const previousOrders = queryClient.getQueryData<PurchaseOrder[]>(queryKey)

      queryClient.setQueryData<PurchaseOrder[]>(queryKey, (old = []) =>
        old.map((order) =>
          order.id !== item.purchase_order_id
            ? order
            : {
                ...order,
                order_items: order.order_items.map((oi) =>
                  oi.id === item.id
                    ? {
                        ...oi,
                        scrap: {
                          ...oi.scrap!,
                          pre_melt: item.scrap!.pre_melt,
                          post_melt: item.scrap!.post_melt,
                          purity: item.scrap!.purity,
                        },
                      }
                    : oi
                ),
              }
        )
      )

      return { previousOrders, queryKey }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousOrders && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousOrders)
      }
    },
    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey, refetchType: 'active' })
      }
    },
  })
}

export const useDeleteOrderScrapItems = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      ids,
      purchase_order_id,
    }: {
      ids: string[]
      purchase_order_id: string
    }) => {
      if (!user?.id) throw new Error('Not authenticated')
      return await apiRequest('POST', '/admin/delete_order_scrap_items', { ids })
    },

    onMutate: async ({ ids, purchase_order_id }) => {
      const queryKey = ['admin_purchase_orders', user]
      await queryClient.cancelQueries({ queryKey })

      const previousOrders = queryClient.getQueryData<PurchaseOrder[]>(queryKey)

      queryClient.setQueryData<PurchaseOrder[]>(queryKey, (old = []) =>
        old.map((order) =>
          order.id !== purchase_order_id
            ? order
            : {
                ...order,
                order_items: order.order_items.filter((oi) => !ids.includes(oi.id)),
              }
        )
      )

      return { previousOrders, queryKey }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousOrders && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousOrders)
      }
    },

    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey, refetchType: 'active' })
      }
    },
  })
}

export const useAddNewOrderScrapItem = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      item,
      purchase_order_id,
    }: {
      item: {
        metal: string
        pre_melt?: number
        purity?: number
        content?: number
        gross_unit?: string
      }
      purchase_order_id: string
    }) => {
      if (!user?.id) throw new Error('Not authenticated')
      return await apiRequest('POST', '/admin/add_new_order_scrap_item', {
        item,
        purchase_order_id,
      })
    },

    onMutate: async ({ item, purchase_order_id }) => {
      const queryKey = ['admin_purchase_orders', user]
      await queryClient.cancelQueries({ queryKey })

      const previousOrders = queryClient.getQueryData<PurchaseOrder[]>(queryKey)

      const optimisticId = `temp-${Date.now()}`
      const optimisticScrapId = `temp-scrap-${Date.now()}`

      const optimisticOrderItem: PurchaseOrderItem = {
        id: optimisticId,
        purchase_order_id,
        item_type: 'scrap',
        scrap: {
          id: optimisticScrapId,
          metal: item.metal,
          pre_melt: item.pre_melt ?? 1,
          purity: item.purity ?? 1,
          content: item.content ?? (item.pre_melt ?? 1) * (item.purity ?? 1),
          gross_unit: item.gross_unit ?? 't oz',
          name: `${item.metal} Item`,
        },
        quantity: 1,
        confirmed: false,
      }

      queryClient.setQueryData<PurchaseOrder[]>(queryKey, (old = []) =>
        old.map((order) =>
          order.id !== purchase_order_id
            ? order
            : {
                ...order,
                order_items: [optimisticOrderItem, ...order.order_items],
              }
        )
      )

      return { previousOrders, queryKey }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousOrders && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousOrders)
      }
    },

    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({
          queryKey: context.queryKey,
          refetchType: 'active',
        })
      }
    },
  })
}

export const useUpdateOrderBullionItem = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: PurchaseOrderItem) => {
      if (!user?.id) throw new Error('Not authenticated')
      return await apiRequest('POST', '/admin/update_order_bullion_item', { item })
    },
    onMutate: async (item) => {
      const queryKey = ['admin_purchase_orders', user]
      await queryClient.cancelQueries({ queryKey })

      const previousOrders = queryClient.getQueryData<PurchaseOrder[]>(queryKey)

      queryClient.setQueryData<PurchaseOrder[]>(queryKey, (old = []) =>
        old.map((order) =>
          order.id !== item.purchase_order_id
            ? order
            : {
                ...order,
                order_items: order.order_items.map((oi) =>
                  oi.id === item.id
                    ? {
                        ...oi,
                        quantity: item.quantity,
                        bullion_premium: item.bullion_premium,
                        product: {
                          ...oi.product!,
                        },
                      }
                    : oi
                ),
              }
        )
      )

      return { previousOrders, queryKey }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousOrders && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousOrders)
      }
    },
    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey, refetchType: 'active' })
      }
    },
  })
}

export const useDeleteOrderBullionItems = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      ids,
      purchase_order_id,
    }: {
      ids: string[]
      purchase_order_id: string
    }) => {
      if (!user?.id) throw new Error('Not authenticated')
      return await apiRequest('POST', '/admin/delete_order_bullion_items', { ids })
    },

    onMutate: async ({ ids, purchase_order_id }) => {
      const queryKey = ['admin_purchase_orders', user]
      await queryClient.cancelQueries({ queryKey })

      const previousOrders = queryClient.getQueryData<PurchaseOrder[]>(queryKey)

      queryClient.setQueryData<PurchaseOrder[]>(queryKey, (old = []) =>
        old.map((order) =>
          order.id !== purchase_order_id
            ? order
            : {
                ...order,
                order_items: order.order_items.filter((oi) => !ids.includes(oi.id)),
              }
        )
      )

      return { previousOrders, queryKey }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousOrders && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousOrders)
      }
    },

    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey, refetchType: 'active' })
      }
    },
  })
}

export const useAddNewOrderBullionItem = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      item,
      purchase_order_id,
    }: {
      item: Product
      purchase_order_id: string
    }) => {
      if (!user?.id) throw new Error('Not authenticated')
      return await apiRequest('POST', '/admin/add_new_order_bullion_item', {
        item,
        purchase_order_id,
      })
    },

    onMutate: async ({ item, purchase_order_id }) => {
      const queryKey = ['admin_purchase_orders', user]
      await queryClient.cancelQueries({ queryKey })

      const previousOrders = queryClient.getQueryData<PurchaseOrder[]>(queryKey)

      const optimisticId = `temp-${Date.now()}`
      const optimisticScrapId = `temp-product-${Date.now()}`

      const optimisticOrderItem: PurchaseOrderItem = {
        id: optimisticId,
        purchase_order_id,
        item_type: 'product',
        product: item,
        quantity: 1,
        confirmed: false,
      }

      queryClient.setQueryData<PurchaseOrder[]>(queryKey, (old = []) =>
        old.map((order) =>
          order.id !== purchase_order_id
            ? order
            : {
                ...order,
                order_items: [optimisticOrderItem, ...order.order_items],
              }
        )
      )

      return { previousOrders, queryKey }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousOrders && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousOrders)
      }
    },

    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({
          queryKey: context.queryKey,
          refetchType: 'active',
        })
      }
    },
  })
}

export const useAcceptOffer = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      purchase_order,
      order_spots,
      spot_prices,
    }: {
      purchase_order: PurchaseOrder
      order_spots: SpotPrice[]
      spot_prices: SpotPrice[]
    }) => {
      if (!user?.id) throw new Error('User is not authenticated')
      return await apiRequest<{ purchaseOrder: PurchaseOrder; orderSpots: SpotPrice[] }>(
        'POST',
        '/admin/accept_offer',
        {
          user_id: user.id,
          order: purchase_order,
          order_spots,
          spot_prices,
        }
      )
    },

    onMutate: async ({ purchase_order, order_spots, spot_prices }) => {
      const queryKey = ['admin_purchase_orders', user]
      await queryClient.cancelQueries({ queryKey })

      const previousOrders = queryClient.getQueryData<PurchaseOrder[]>(queryKey)

      const payoutMethod = payoutOptions.find((p) => p.method === purchase_order.payout?.method)
      const payoutFee = payoutMethod?.cost ?? 0

      queryClient.setQueryData<PurchaseOrder[]>(queryKey, (old = []) =>
        old.map((order) =>
          order.id !== purchase_order.id
            ? order
            : {
                ...order,
                offer_status: 'Accepted',
                purchase_order_status: 'Accepted',
                spots_locked: true,
                order_items: purchase_order.order_items.map((item) => ({
                  ...item,
                  price: getPurchaseOrderItemPrice(item, spot_prices),
                })),
                total_price: getPurchaseOrderTotal(
                  purchase_order,
                  spot_prices,
                  order_spots,
                  payoutFee
                ),
              }
        )
      )
      return { previousOrders, queryKey, spot_prices }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousOrders && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousOrders)
      }
    },
    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey, refetchType: 'active' })
      }
    },
    onSuccess: async (data, context) => {
      await apiRequest('POST', '/purchase_orders/send_offer_accepted_email', {
        order: data.purchaseOrder,
        order_spots: data.orderSpots,
        spot_prices: context.spot_prices,
      })
    },
  })
}

export const useRejectOffer = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      purchase_order,
      offer_notes,
    }: {
      purchase_order: PurchaseOrder
      offer_notes: string
    }) => {
      if (!user?.id) throw new Error('User is not authenticated')
      return await apiRequest<PurchaseOrder>('POST', '/admin/reject_offer', {
        user_id: user.id,
        order: purchase_order,
        offer_notes,
      })
    },

    onMutate: async ({ purchase_order, offer_notes }) => {
      const queryKey = ['admin_purchase_orders', user]
      await queryClient.cancelQueries({ queryKey })

      const previousOrders = queryClient.getQueryData<PurchaseOrder[]>(queryKey)

      queryClient.setQueryData<PurchaseOrder[]>(queryKey, (old = []) =>
        old.map((order) =>
          order.id !== purchase_order.id
            ? order
            : {
                ...order,
                offer_status: 'Rejected',
                purchase_order_status: 'Rejected',
                offer_notes,
                num_rejections: order.num_rejections + 1,
              }
        )
      )

      return { previousOrders, queryKey }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousOrders && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousOrders)
      }
    },

    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey, refetchType: 'active' })
      }
    },
  })
}

export const useUpdateRejectedOffer = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ purchase_order }: { purchase_order: PurchaseOrder }) => {
      if (!user?.id) throw new Error('User is not authenticated')
      return await apiRequest<PurchaseOrder>('POST', '/admin/update_rejected_offer', {
        user_name: user.name,
        order: purchase_order,
      })
    },

    onMutate: async ({ purchase_order }) => {
      const queryKey = ['admin_purchase_orders', user]
      await queryClient.cancelQueries({ queryKey })

      const previousOrders = queryClient.getQueryData<PurchaseOrder[]>(queryKey)

      queryClient.setQueryData<PurchaseOrder[]>(queryKey, (old = []) =>
        old.map((order) =>
          order.id !== purchase_order.id
            ? order
            : {
                ...order,
                offer_status: order.offer_status === 'Resent' ? 'Rejected' : 'Resent',
                purchase_order_status: 'Rejected',
              }
        )
      )

      return { previousOrders, queryKey }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousOrders && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousOrders)
      }
    },

    onSettled: (_data, _err, _vars, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey, refetchType: 'active' })
      }
    },
  })
}

// export const updateWaiveFees = () => {
//   const { user } = useGetSession()
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: async ({ purchase_order }: { purchase_order: PurchaseOrder }) => {
//       if (!user?.id) throw new Error('User is not authenticated')
//       return await apiRequest<PurchaseOrder>('POST', '/admin/update_rejected_offer', {
//         user_name: user.name,
//         order: purchase_order,
//       })
//     },

//     onMutate: async ({ purchase_order }) => {
//       const queryKey = ['admin_purchase_orders', user]
//       await queryClient.cancelQueries({ queryKey })

//       const previousOrders = queryClient.getQueryData<PurchaseOrder[]>(queryKey)

//       queryClient.setQueryData<PurchaseOrder[]>(queryKey, (old = []) =>
//         old.map((order) =>
//           order.id !== purchase_order.id
//             ? order
//             : {
//                 ...order,
//                 offer_status: order.offer_status === 'Resent' ? 'Rejected' : 'Resent',
//                 purchase_order_status: 'Rejected',
//               }
//         )
//       )

//       return { previousOrders, queryKey }
//     },

//     onError: (_err, _vars, context) => {
//       if (context?.previousOrders && context.queryKey) {
//         queryClient.setQueryData(context.queryKey, context.previousOrders)
//       }
//     },

//     onSettled: (_data, _err, _vars, context) => {
//       if (context?.queryKey) {
//         queryClient.invalidateQueries({ queryKey: context.queryKey, refetchType: 'active' })
//       }
//     },
//   })
// }
