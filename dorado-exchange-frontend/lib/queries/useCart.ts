import { useMutation } from '@tanstack/react-query'
import { apiRequest } from '@/utils/axiosInstance'
import { cartStore } from '@/store/cartStore'
import { useEffect } from 'react'
import { useUser } from '../authClient'

export const useSyncCartToBackend = () => {
   const { user } = useUser();

  return useMutation({
    mutationFn: async () => {
      const items = cartStore.getState().items

      if (!user?.id) {
        throw new Error('Missing user')
      }

      return await apiRequest('POST', '/cart/sync_cart', {
        user_id: user.id,
        cart: items,
      })
    },
  })
}

export const useCartAutoSync = () => {
  const { user } = useUser();
  const syncCartMutation = useSyncCartToBackend()

  useEffect(() => {
    if (!user?.id) return
    const interval = setInterval(() => {
      syncCartMutation.mutate()
    }, 15000)

    return () => clearInterval(interval)
  }, [user?.id])
}