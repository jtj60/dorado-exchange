'use client'

import { Button } from '@/components/ui/button'
import { useAddress } from '@/lib/queries/useAddresses'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSpotPrices } from '@/lib/queries/useSpotPrices'
import { useUser } from '@/lib/authClient'
import { cartStore } from '@/store/cartStore'
import { useSalesOrderCheckoutStore } from '@/store/salesOrderCheckoutStore'
import ShippingSelect from './shipping/shippingSelect'

import { loadStripe } from '@stripe/stripe-js'
import { useRetrievePaymentIntent, useUpdatePaymentIntent } from '@/lib/queries/useStripe'
import StripeWrapper from '../stripe/StripeWrapper'
import PaymentSelect from './payment/paymentSelect'
import { salesOrderCheckoutSchema } from '@/types/sales-orders'
import { useCreateSalesOrder } from '@/lib/queries/useSalesOrders'
import { calculateSalesOrderPrices } from '@/utils/calculateSalesOrderPrices'
import OrderSummary from './summary/orderSummary'
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function SalesOrderCheckout() {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const router = useRouter()

  const { data } = useSalesOrderCheckoutStore()
  const cartItems = cartStore((state) => state.items)

  const { data: spotPrices = [] } = useSpotPrices()
  const { data: addresses = [], isPending: isAddressesPending } = useAddress()
  const { user } = useUser()
  const createOrder = useCreateSalesOrder()
  const updatePaymentIntent = useUpdatePaymentIntent()
  const { data: clientSecret } = useRetrievePaymentIntent('sales_order_checkout')

  const orderPrices = useMemo(() => {
    return calculateSalesOrderPrices(
      cartItems,
      data.using_funds ?? true,
      spotPrices,
      user?.dorado_funds ?? 0,
      data.service?.cost ?? 0,
      data.payment_method ?? 'CARD_AND_FUNDS'
    )
  }, [
    cartItems,
    data.using_funds,
    spotPrices,
    user?.dorado_funds,
    data.service?.cost,
    data.payment_method,
  ])

  const cardNeeded = useMemo(() => {
    console.log(data.payment_method)
    if (data.payment_method === 'FUNDS') {
      return false
    } else {
      return true
    }
  }, [data.payment_method])

  useEffect(() => {
    if (clientSecret && orderPrices.baseTotal > 0 && cardNeeded) {
      updatePaymentIntent.mutate({
        items: cartItems,
        using_funds: data?.using_funds ?? true,
        spots: spotPrices,
        user: user!,
        shipping_service: data.service?.value ?? 'STANDARD',
        payment_method: data.payment_method ?? 'CARD_AND_FUNDS',
        type: 'sales_order_checkout',
      })
    }
  }, [
    cartItems,
    data.using_funds,
    spotPrices,
    clientSecret,
    orderPrices.baseTotal,
    data.payment_method,
    user,
    cardNeeded,
  ])

  const handleSubmit = () => {
    const checkoutPayload = {
      ...data,
      address: data.address!,
      service: data.service!,
      items: cartItems,
    }

    const validated = salesOrderCheckoutSchema.parse(checkoutPayload)

    createOrder.mutate(
      { sales_order: validated, spotPrices: spotPrices },
      {
        onSuccess: () => {
          router.push('/order-placed')
          cartStore.getState().clearCart()
          useSalesOrderCheckoutStore.getState().clear()
        },
      }
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full p-10 text-center">
        <h2 className="text-xl font-semibold text-neutral-800">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground mt-2">
          You need to add items before checking out.
        </p>
        <Button
          variant="default"
          className="mt-6 liquid-gold raised-off-screen shine-on-hover px-5 py-4"
          onClick={() => router.push('/buy')}
        >
          Add Items
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full justify-center p-4">
      {!isAddressesPending && (
        <div className="flex flex-col lg:flex-row items-center lg:items-start w-full lg:max-w-7xl justify-between gap-6">
          <div className="flex flex-col gap-6 w-full">
            <ShippingSelect
              addresses={addresses}
              isLoading={isAddressesPending}
              orderPrices={orderPrices}
            />
            <div className="separator-inset" />
            <PaymentSelect orderPrices={orderPrices} />
            {clientSecret && data.address && cardNeeded && (
              <StripeWrapper
                clientSecret={clientSecret}
                stripePromise={stripePromise}
                address={data.address}
                setIsLoading={setIsLoading}
              />
            )}
          </div>
          <div className="flex flex-col gap-3 w-full lg:mt-5">
            <OrderSummary orderPrices={orderPrices} />
            {!cardNeeded ? (
              <Button
                className="raised-off-page liquid-gold shine-on-hover w-full text-white"
                disabled={createOrder.isPending || isLoading}
                onClick={handleSubmit}
              >
                {createOrder.isPending || isLoading ? 'Processing…' : 'Place Order'}
              </Button>
            ) : (
              <Button
                className="raised-off-page liquid-gold shine-on-hover w-full text-white"
                disabled={createOrder.isPending || isLoading}
                type="submit"
                form="payment-form"
              >
                {createOrder.isPending || isLoading ? 'Processing…' : 'Place Order'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
