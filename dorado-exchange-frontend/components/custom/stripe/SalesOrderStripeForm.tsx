'use client'

import React, { useState, FormEvent } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import type { StripePaymentElementOptions } from '@stripe/stripe-js'
import { Address } from '@/types/address'
import { useGetSession } from '@/lib/queries/useAuth'
import { useSalesOrderCheckoutStore } from '@/store/salesOrderCheckoutStore'
import { useCreateSalesOrder } from '@/lib/queries/useSalesOrders'
import { salesOrderCheckoutSchema } from '@/types/sales-orders'
import { useRouter } from 'next/navigation'
import { cartStore } from '@/store/cartStore'
import { useSpotPrices } from '@/lib/queries/useSpotPrices'

export default function SalesOrderStripeForm({
  address,
  setIsLoading,
}: {
  address: Address
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const orderData = useSalesOrderCheckoutStore((state) => state.data)

  const { data: spotPrices = [] } = useSpotPrices()
  const createOrder = useCreateSalesOrder()
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useGetSession()

  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsLoading(true)
    setMessage(null)

    const { paymentIntent, error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/order-placed`,
        payment_method_data: {
          billing_details: {
            name: user?.name,
            phone: address.phone_number,
            email: user?.email,
            address: {
              line1: address.line_1,
              line2: address.line_2,
              city: address.city,
              state: address.state,
              postal_code: address.zip,
              country: address.country_code,
            },
          },
        },
      },
      redirect: 'if_required',
    })
    if (paymentIntent?.status === 'requires_capture') {

      console.log('here')
      const liveItems = cartStore.getState().items

      const checkoutPayload = {
        ...orderData,
        address: orderData.address!,
        service: orderData.service!,
        items: liveItems,
      }

      const validated = salesOrderCheckoutSchema.parse(checkoutPayload)

      createOrder.mutate(
        {
          paymentIntentId: paymentIntent.id,
          sales_order: validated,
          spotPrices: spotPrices,
        },
        {
          onSuccess: () => {
            console.log('going to order placed')
            router.push('/order-placed')
            cartStore.getState().clearCart()
            useSalesOrderCheckoutStore.getState().clear()
          },
        }
      )
    } else if (error?.type === 'card_error' || error?.type === 'validation_error') {
      setMessage(error.message ?? 'A payment error occurred.')
    } else if (error) {
      setMessage('An unexpected payment error occurred.')
    }

    setIsLoading(false)
  }

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: {
      type: 'accordion',
      defaultCollapsed: false,
      radios: true,
      spacedAccordionItems: false,
    },
    defaultValues: {
      billingDetails: {

        phone: address.phone_number,
        address: {
          line1: address.line_1,
          line2: address.line_2,
          city: address.city,
          state: address.state,
          postal_code: address.zip,
          country: address.country_code,
        },
      },
    },
    fields: {
      billingDetails: {
        address: {
          line1: 'never',
          line2: 'never',
          city: 'never',
          state: 'never',
          postalCode: 'never',
          country: 'never',
        },
        name: 'auto',
        email: 'never',
        phone: 'never',
      },
    },
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      {message && <div id="payment-message">{message}</div>}
    </form>
  )
}
