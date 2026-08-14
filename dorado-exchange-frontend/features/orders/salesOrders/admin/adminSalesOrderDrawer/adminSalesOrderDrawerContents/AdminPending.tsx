import { useCancelPaymentIntent, useGetSalesOrderPaymentIntent } from '@/features/stripe/queries'
import PriceNumberFlow from '@/shared/ui/PriceNumberFlow'
import { Button } from '@/shared/ui/base/button'
import { cn } from '@/shared/utils/cn'
import { paymentOptions, SalesOrderDrawerContentProps, statusConfig } from '@/features/orders/salesOrders/types'

export default function AdminPendingSalesOrder({ order }: SalesOrderDrawerContentProps) {
  const { data: paymentIntent } = useGetSalesOrderPaymentIntent(order.id)
  const cancelPaymentIntent = useCancelPaymentIntent(order.id)
  const status = statusConfig[order.sales_order_status]

  const paymentType = paymentOptions.find((p) => p.value === paymentIntent?.method_type)
  const Icon = paymentType?.icon

  return (
    <>
      {paymentIntent && (
        <div className="flex flex-col gap-4 on-glass rounded-lg h-full p-4">
          <div className="flex items-center w-full justify-between">
            <div className="text-lg text-neutral-800 flex items-center gap-2">
              <Icon size={24} />
              {paymentType?.label}
            </div>
            <div
              className={cn(
                'text-sm p-1 px-2 rounded-lg',
                paymentIntent.payment_status === 'succeeded'
                  ? 'success-on-glass'
                  : paymentIntent.payment_status === 'processing'
                  ? 'primary-on-glass'
                  : 'destructive-on-glass'
              )}
            >
              {paymentIntent?.payment_status === 'requires_payment_method'
                ? 'Failed'
                : paymentIntent?.payment_status
                    .toLowerCase()
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
            </div>
          </div>

          <div className="glass-divider" />

          {paymentIntent.card_brand && (
            <div className="flex items-center w-full justify-between">
              <div className="text-base text-neutral-600">Card Brand:</div>
              <div className="text-base text-neutral-800">
                {paymentIntent.card_brand
                  .toLowerCase()
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </div>
            </div>
          )}

          {paymentIntent.bank_name && (
            <div className="flex items-center w-full justify-between">
              <div className="text-base text-neutral-600">Bank Name:</div>
              <div className="text-base text-neutral-800">
                {paymentIntent.bank_name
                  .toLowerCase()
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </div>
            </div>
          )}

          {paymentIntent.bank_account_type && (
            <div className="flex items-center w-full justify-between">
              <div className="text-base text-neutral-600">Account Type:</div>
              <div className="text-base text-neutral-800">
                {paymentIntent.bank_account_type
                  .toLowerCase()
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </div>
            </div>
          )}
          {paymentIntent.last_four && (
            <div className="flex items-center w-full justify-between">
              <div className="text-base text-neutral-600">
                {paymentType?.method !== 'ACH' ? 'Card Number:' : 'Account Number'}
              </div>
              <div className="text-base text-neutral-800">*******{paymentIntent.last_four}</div>
            </div>
          )}
          {paymentIntent.routing && (
            <div className="flex items-center w-full justify-between">
              <div className="text-base text-neutral-600">Routing Number:</div>
              <div className="text-base text-neutral-800">
                {paymentIntent.routing
                  .toLowerCase()
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </div>
            </div>
          )}
          <div className="glass-divider" />

          <div className="flex items-center w-full justify-between">
            <div className="text-end text-neutral-600">Total Due:</div>
            <div className="text-xl text-neutral-800">
              <PriceNumberFlow value={paymentIntent.amount / 100} />
            </div>
          </div>

          <div className="flex items-center w-full justify-between">
            <div className="text-end text-neutral-600">Amount Paid:</div>
            <div className="text-xl text-neutral-800">
              <PriceNumberFlow value={paymentIntent.amount_received / 100} />
            </div>
          </div>

          <div className="flex items-center w-full justify-between">
            <div className="text-end text-neutral-600">Remaining Balance:</div>
            <div className="text-xl text-neutral-800">
              <PriceNumberFlow
                value={(paymentIntent.amount - paymentIntent.amount_received) / 100}
              />
            </div>
          </div>
          <div className="glass-divider" />
          <Button
            className={cn(
              'on-glass hover:border-none',
              'text-primary',
              'hover:bg-primary',
              'border-primary',
              'hover:text-white raised-off-page'
            )}
            onClick={() => cancelPaymentIntent.mutate(paymentIntent.payment_intent_id)}
            disabled={
              cancelPaymentIntent.isPending ||
              ['canceled', 'succeeded', 'processing'].includes(paymentIntent.payment_status)
            }
          >
            {cancelPaymentIntent.isPending ? 'Cancelling...' : 'Cancel Payment'}
          </Button>
        </div>
      )}
    </>
  )
}
