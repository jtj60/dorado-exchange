'use client'

import PurchaseOrderDrawerContent from './purchaseOrderDrawerContent'
import PurchaseOrderDrawerHeader from './purchaseOrderDrawerHeader'
import PurchaseOrderDrawerFooter from './purchaseOrderDrawerFooter'
import { PurchaseOrderDrawerProps } from '@/types/purchase-order'
import { useAdminPurchaseOrders } from '@/lib/queries/admin/useAdminPurchaseOrders'
import { useDrawerStore } from '@/store/drawerStore'
import Drawer from '@/components/ui/drawer'
import { useMemo } from 'react'
import { usePurchaseOrders } from '@/lib/queries/usePurchaseOrders'

export default function PurchaseOrderDrawer({ order_id, user }: PurchaseOrderDrawerProps) {
  const { data: orders = [] } = usePurchaseOrders()
  const order = useMemo(() => orders.find((o) => o.id === order_id), [orders, order_id])

  const { activeDrawer, closeDrawer } = useDrawerStore()

  const isDrawerOpen = activeDrawer === 'purchaseOrder'

  if (!order) {
    return null
  }

  return (
    <Drawer open={isDrawerOpen} setOpen={closeDrawer}>
      <div className="flex flex-col flex-1 h-full space-y-4 p-5 overflow-y-scroll sm:overflow-y-auto pb-30 sm:pb-5">
        <PurchaseOrderDrawerHeader
          order={order}
          username={user?.name ?? ''}
          setIsOrderActive={() => {}}
        />
        <PurchaseOrderDrawerContent order={order} />

        <div className="mt-auto">
          <PurchaseOrderDrawerFooter order={order} />
        </div>
      </div>
    </Drawer>
  )
}
