import { Button } from '@/components/ui/button'
import {
  PurchaseOrder,
  PurchaseOrderActionButtonsProps,
  statusConfig,
} from '@/types/purchase-order'
import { cn } from '@/lib/utils' // assuming you're using your cn() utility
import { useMovePurchaseOrderStatus } from '@/lib/queries/admin/useAdminPurchaseOrders'
import { useMemo } from 'react'

export function PurchaseOrderActionButtons({ order }: PurchaseOrderActionButtonsProps) {
  const movePurchaseOrderStatus = useMovePurchaseOrderStatus()
  const handleAction = (action: string, status: string) => {
    if (action !== 'adjust_price' && action !== 'reopen_order') {
      movePurchaseOrderStatus.mutate({
        order_status: status,
        order: order,
        action: action,
      })
    }
  }

  const allItemsConfirmed = useMemo(() => {
    return order.order_items.every((item) => item.confirmed)
  }, [order.order_items])

  const getButtonActions = () => {
    switch (order.purchase_order_status) {
      case 'In Transit':
        return [
          {
            label: 'Move to Received',
            action: 'move_to_received',
            status: 'Received',
            disabled: false,
          },
        ]
      case 'Received':
        return [
          {
            label: 'Move to Offer Sent',
            action: 'move_to_offer_sent',
            status: 'Offer Sent',
            disabled: !allItemsConfirmed,
          },
          {
            label: 'Back to In Transit',
            action: 'move_to_in_transit',
            status: 'In Transit',
            disabled: false,
          },
        ]
      case 'Offer Sent':
        return [
          {
            label: 'Move to Accepted',
            action: 'move_to_accepted',
            status: 'Accepted',
            disabled: false,
          },
          {
            label: 'Move to Rejected',
            action: 'move_to_rejected',
            status: 'Rejected',
            disabled: false,
          },
          {
            label: 'Back to Received',
            action: 'move_to_received',
            status: 'Received',
            disabled: false,
          },
        ]
      case 'Accepted':
        return [
          { label: 'Move to Paid', action: 'move_to_paid', status: 'Paid', disabled: false },
          {
            label: 'Back to Offer Sent',
            action: 'move_to_offer_sent',
            status: 'Offer Sent',
            disabled: !allItemsConfirmed,
          },
        ]
      case 'Rejected':
        return [
          {
            label: 'Adjust Price',
            action: 'move_to_received',
            status: 'Received',
            disabled: false,
          },
          {
            label: 'Move to Cancelled',
            action: 'move_to_cancelled',
            status: 'Cancelled',
            disabled: false,
          },
          {
            label: 'Back to Offer Sent',
            action: 'move_to_offer_sent',
            status: 'Offer Sent',
            disabled: !allItemsConfirmed,
          },
        ]
      case 'Paid':
        return [
          {
            label: 'Move to Completed',
            action: 'move_to_completed',
            status: 'Completed',
            disabled: false,
          },
        ]
      case 'Cancelled':
        return [
          {
            label: 'Reopen Order',
            action: 'move_to_received',
            status: 'Received',
            disabled: false,
          },
        ]
      case 'Completed':
        return [{ label: 'Move to Paid', action: 'move_to_paid', status: 'paid', disabled: false }]
      default:
        return []
    }
  }

  const buttons = getButtonActions()
  const status = statusConfig[order.purchase_order_status]

  return (
    <div className="flex flex-col w-full gap-2 mt-4">
      {buttons.map((button, index) => {
        const isSecondaryStyle = index === 1
        const isTertiaryStyle = index === 2

        return (
          <Button
            key={index}
            onClick={() => handleAction(button.action, button.status)}
            variant={button.label === 'Adjust Price' ? 'outline' : 'default'}
            disabled={button.disabled}
            className={cn(
              'w-full transition-colors text-white',
              isSecondaryStyle
                ? cn(
                    'bg-card',
                    status?.text_color,
                    status?.hover_background_color,
                    'hover:text-white raised-off-page'
                  )
                : isTertiaryStyle
                ? cn(
                    'bg-transparent',
                    status?.text_color,
                    'flex justify-start p-0 h-4 hover:bg-transparent'
                  )
                : cn(status?.background_color, status?.hover_background_color, 'raised-off-page')
            )}
          >
            {button.label}
          </Button>
        )
      })}
    </div>
  )
}
