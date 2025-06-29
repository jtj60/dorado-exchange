'use client'

import { usePurchaseOrderCheckoutStore } from '@/store/purchaseOrderCheckoutStore'
import formatPhoneNumber from '@/utils/formatPhoneNumber'
import { Button } from '@/components/ui/button'
import { formatPickupDateShort, formatPickupTime, formatTimeDiff } from '@/utils/dateFormatting'
import ItemTables from './itemTable'
import { useCreatePurchaseOrder } from '@/lib/queries/usePurchaseOrders'
import { purchaseOrderCheckoutSchema } from '@/types/purchase-order'
import { sellCartStore } from '@/store/sellCartStore'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export default function ReviewStep() {
  const data = usePurchaseOrderCheckoutStore((state) => state.data)
  const createPurchaseOrder = useCreatePurchaseOrder()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex flex-col gap-4 w-full text-sm text-neutral-800">

      <div className="rounded-xl border border-border bg-card px-4 py-3 raised-off-page">
        <div className="flex w-full items-center justify-between">
          <div className="text-xl text-neutral-800">{data.address?.name}</div>
          <div className="text-base text-neutral-600">
            {formatPhoneNumber(data.address?.phone_number ?? '')}
          </div>
        </div>

        <div className="mt-2 leading-snug">
          {data.address?.line_1} {data.address?.line_2} <br /> {data.address?.city},{' '}
          {data.address?.state} {data.address?.zip}
        </div>
      </div>


      <div className="rounded-xl border border-border bg-card px-4 py-3 raised-off-page">
        <div className="flex justify-between items-center">
          <div className="text-xl text-neutral-800">
            {data.service?.serviceDescription ?? 'Shipping Service'}
          </div>
          <div className="text-sm font-normal text-neutral-600">
            {formatTimeDiff(data.service?.transitTime ?? new Date())}
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <span className="text-neutral-800">{data.package?.label}</span>
          <span className="text-neutral-600">
            {data.package?.dimensions &&
              `${Math.round(data.package.dimensions.height)} × ${Math.round(
                data.package.dimensions.width
              )} × ${Math.round(data.package.dimensions.length)} in`}
          </span>
        </div>

        <div className="mt-1 flex justify-between items-center">
          <span className="text-neutral-800">{data.pickup?.name}</span>
          {data.pickup?.name === 'Carrier Pickup' ? (
            <span className="text-neutral-600">
              {formatPickupTime(data.pickup?.time)} on {formatPickupDateShort(data.pickup?.date)}
            </span>
          ) : (
            <Button variant="link" className="h-auto p-0 text-sm font-normal hover:underline">
              Find Store
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card px-4 py-3 raised-off-page">
        <div className="flex justify-between">
          <div className="text-xl text-neutral-800">
            {
              {
                ACH: 'ACH',
                WIRE: 'Wire',
                ECHECK: 'eCheck',
                DORADO_ACCOUNT: 'Dorado Account',
              }[data.payout?.method ?? 'ACH']
            }
          </div>
          <div className="text-base text-neutral-600">
            {data.payout?.method === 'ACH' || data.payout?.method === 'WIRE' ? (
              <div className="text-neutral-600 mb-3">
                {data.payout.bank_name}{' '}
                {data.payout?.method === 'ACH' ? data.payout.account_type : ''}
              </div>
            ) : null}
          </div>
        </div>

        {(data.payout?.method === 'ACH' || data.payout?.method === 'WIRE') && (
          <>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Account Holder:</span>
                <span className="text-neutral-800">{data.payout.account_holder_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Routing Number:</span>
                <span className="text-neutral-800">{data.payout.routing_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Account Number:</span>
                <span className="text-neutral-800">{data.payout.account_number}</span>
              </div>
            </div>
          </>
        )}

        {data.payout?.method === 'ECHECK' ||
          (data.payout?.method === 'DORADO_ACCOUNT' && (
            <div className="flex flex-col gap-1 mt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Name:</span>
                <span className="text-neutral-800">{data.payout.account_holder_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Email:</span>
                <span className="text-neutral-800">{data.payout.payout_email}</span>
              </div>
            </div>
          ))}
      </div>

      <ItemTables />

      <Button
        className="ml-auto raised-off-page primary-gradient shine-on-hover text-white w-full mt-2"
        disabled={createPurchaseOrder.isPending}
        onClick={() => {
          const liveCartItems = sellCartStore.getState().items
          const checkoutPayload = {
            ...data,
            items: liveCartItems,
          }

          try {
            const validated = purchaseOrderCheckoutSchema.parse(checkoutPayload)

            createPurchaseOrder.mutate(validated, {
              onSuccess: async () => {
                startTransition(() => {
                  router.push('/order-placed')
                })
                sellCartStore.getState().clearCart()
                usePurchaseOrderCheckoutStore.getState().clear()
              },
            })
          } catch (err) {
            console.error('Invalid purchase order data', err)
          }
        }}
      >
        {createPurchaseOrder.isPending || isPending ? 'Placing Order…' : 'Confirm and Place Order'}
      </Button>
    </div>
  )
}
