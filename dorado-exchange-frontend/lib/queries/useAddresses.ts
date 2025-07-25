import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/utils/axiosInstance'
import { Address } from '@/types/address'
import { useGetSession } from './useAuth'

export const useAddress = () => {
  const { user } = useGetSession()

  return useQuery<Address[]>({
    queryKey: ['address', user],
    queryFn: async () => {
      if (!user?.id) return []
      return await apiRequest<Address[]>('GET', '/addresses/get_addresses', undefined, {
        user_id: user.id,
      })
    },
    enabled: !!user,
  })
}

export const useUserAddress = (user_id: string) => {
  return useQuery<Address[]>({
    queryKey: ['address', user_id],
    queryFn: async () => {
      if (!user_id) return []
      return await apiRequest<Address[]>('GET', '/addresses/get_addresses', undefined, {
        user_id: user_id,
      })
    },
    enabled: !!user_id,
  })
}

export const useUpdateAddress = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (address: Address) => {
      if (!user?.id) throw new Error('User is not authenticated')
      return await apiRequest<Address>('POST', '/addresses/create_and_update_address', {
        user_id: user.id,
        address,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['address', user], refetchType: 'active' })
    },
  })
}

export const useDeleteAddress = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (address: Address) => {
      if (!user?.id) throw new Error('User is not authenticated')
      return await apiRequest('DELETE', '/addresses/delete_address', {
        user_id: user.id,
        address,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['address', user], refetchType: 'active' })
    },
  })
}

export const useSetDefaultAddress = () => {
  const { user } = useGetSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (address: Address) => {
      if (!user?.id) throw new Error('User is not authenticated')
      return await apiRequest('POST', '/addresses/set_default_address', {
        user_id: user.id,
        address,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['address', user], refetchType: 'active' })
    },
  })
}
