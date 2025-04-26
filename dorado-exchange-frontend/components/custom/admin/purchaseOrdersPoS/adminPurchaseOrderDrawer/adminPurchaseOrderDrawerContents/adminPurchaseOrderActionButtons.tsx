import { Button } from '@/components/ui/button'
import { PurchaseOrder, PurchaseOrderActionButtonsProps, statusConfig } from '@/types/purchase-order'
import { cn } from '@/lib/utils' // assuming you're using your cn() utility
import { useMovePurchaseOrderStatus } from '@/lib/queries/admin/useAdminPurchaseOrders'



export function PurchaseOrderActionButtons({ order }: PurchaseOrderActionButtonsProps) {
  const movePurchaseOrderStatus = useMovePurchaseOrderStatus()
  const handleAction = (action: string, status: string) => {
    if (action !== 'adjust_price' && action !== 'reopen_order') {
      movePurchaseOrderStatus.mutate({
        order_status: status,
        order_id: order.id,
      })
    }
  }

  const getButtonActions = () => {
    switch (order.purchase_order_status) {
      case 'In Transit':
        return [{ label: 'Move to Unsettled', action: 'move_to_unsettled', status: 'Unsettled' }]
      case 'Unsettled':
        return [{ label: 'Move to Filled', action: 'move_to_filled', status: 'Filled' }]
      case 'Filled':
        return [
          { label: 'Move to Accepted', action: 'move_to_filled', status: 'Accepted' },
          { label: 'Move to Rejected', action: 'move_to_rejected', status: 'Rejected' },
        ]
      case 'Accepted':
        return [{ label: 'Move to Settled', action: 'move_to_settled', status: 'Settled' }]
      case 'Rejected':
        return [
          { label: 'Adjust Price', action: 'adjust_price', status: 'N/A' },
          { label: 'Move to Cancelled', action: 'move_to_cancelled', status: 'Cancelled' },
        ]
      case 'Settled':
        return [{ label: 'Move to Completed', action: 'move_to_completed', status: 'Completed' }]
      case 'Cancelled':
        return [{ label: 'Reopen Order', action: 'reopen_order', status: 'N/A' }]
      case 'Completed':
        return [{ label: 'Move to Settled', action: 'move_to_settled', status: 'Settled' }]
      default:
        return []
    }
  }

  const buttons = getButtonActions()
  const status = statusConfig[order.purchase_order_status]

  return (
    <div className="flex flex-col w-full gap-2">
      {buttons.map((button, index) => {
        const isTransparentStyle = index === 1

        return (
          <Button
            key={index}
            onClick={() => handleAction(button.action, button.status)}
            variant={button.label === 'Adjust Price' ? 'outline' : 'default'}
            className={cn(
              'w-full transition-colors',
              isTransparentStyle
                ? cn(
                    'bg-transparent border',
                    status?.border_color,
                    status?.text_color,
                    status?.hover_background_color,
                    'hover:text-white'
                  )
                : cn(status?.background_color, status?.hover_background_color)
            )}
          >
            {button.label}
          </Button>
        )
      })}
    </div>
  )
}
