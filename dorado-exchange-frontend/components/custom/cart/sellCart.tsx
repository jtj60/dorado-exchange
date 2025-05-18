'use client'

import { Button } from '@/components/ui/button'
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import NumberFlow from '@number-flow/react'
import { sellCartStore } from '@/store/sellCartStore'
import { useSpotPrices } from '@/lib/queries/useSpotPrices'
import PriceNumberFlow from '../products/PriceNumberFlow'
import { useRouter } from 'next/navigation'
import getScrapPrice from '@/utils/getScrapPrice'
import { getGrossLabel, getPurityLabel, Scrap } from '@/types/scrap'
import { Product } from '@/types/product'
import getProductBidPrice from '@/utils/getProductBidPrice'
import { useDrawerStore } from '@/store/drawerStore'
import { ShoppingCartSimple } from '@phosphor-icons/react/dist/ssr'
import getPrimaryIconStroke from '@/utils/getPrimaryIconStroke'

export default function SellCart() {
  const router = useRouter()
  const { closeDrawer } = useDrawerStore()

  const items = sellCartStore((state) => state.items)
  const addItem = sellCartStore((state) => state.addItem)
  const removeOne = sellCartStore((state) => state.removeOne)
  const removeAll = sellCartStore((state) => state.removeAll)
  const { data: spotPrices = [] } = useSpotPrices()

  const productItems = items.filter((item) => item.type === 'product')
  const scrapItems = items.filter((item) => item.type === 'scrap')

  const total = items.reduce((acc, item) => {
    if (item.type === 'product') {
      const spot = spotPrices.find((s) => s.type === item.data.metal_type)
      const price = getProductBidPrice(item.data, spot)
      const quantity = item.data.quantity ?? 1
      return acc + price * quantity
    }

    if (item.type === 'scrap') {
      const spot = spotPrices.find((s) => s.type === item.data.metal)
      const price = getScrapPrice(item.data.content ?? 0, spot)
      return acc + price
    }

    return acc
  }, 0)

  const emptyCart = (
    <div className="w-full h-full flex flex-col items-center justify-center text-center gap-4 pb-10">
      <div className="relative mb-5">
        <ShoppingCartSimple size={80} strokeWidth={1.5} color={getPrimaryIconStroke()} />
        <div className="absolute -top-6 right-3.5 border border-border text-xl text-primary-gradient rounded-full w-10 h-10 flex items-center justify-center">
          0
        </div>
      </div>

      <div className="flex-col items-center gap-1 mb-5">
        <h2 className="title-text tracking-wide">Your sell cart is empty!</h2>
        <p className="tertiary-text">Add items to get a price estimate.</p>
      </div>
      <Link href="/sell" passHref>
        <Button
          variant="default"
          onClick={() => {
            router.push('/sell')
            closeDrawer()
          }}
          className="raised-off-page liquid-gold text-white hover:text-white shine-on-hover px-12"
        >
          Start Selling
        </Button>
      </Link>
    </div>
  )

  const renderProductItem = (item: Product, index: number) => {
    const spot = spotPrices.find((s) => s.type === item.metal_type)
    const price = getProductBidPrice(item, spot)
    const quantity = item.quantity ?? 1

    return (
      <div
        key={index}
        className={`flex items-center justify-between w-full gap-4 py-4 ${
          index !== items.length - 1 ? 'border-b border-neutral-300' : 'border-none'
        }`}
      >
        <div className="flex-shrink-0">
          <Image
            src={item.image_front}
            width={80}
            height={80}
            className="pointer-events-none cursor-auto object-contain focus:outline-none drop-shadow-lg"
            alt={item.product_name}
          />
        </div>

        <div className="flex flex-col flex-grow min-w-0">
          <div className="flex justify-between items-start w-full mt-2">
            <div className="flex flex-col">
              <div className="primary-text">{item.product_name}</div>
              <div className="tertiary-text">{item.mint_name}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-card p-0 pb-2"
              onClick={() => removeAll({ type: 'product', data: item })}
            >
              <Trash2 size={16} className="text-neutral-500" />
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-card p-1"
                onClick={() => removeOne({ type: 'product', data: item })}
              >
                <Minus size={16} />
              </Button>
              <NumberFlow value={quantity} className="primary-text" trend={0} />
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-card p-1"
                onClick={() => addItem({ type: 'product', data: {...item, quantity: 1} })}
              >
                <Plus size={16} />
              </Button>
            </div>
            <div className="text-neutral-800 text-base">
              <PriceNumberFlow value={price * quantity} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderScrapItem = (item: Scrap, index: number) => {
    const spot = spotPrices.find((s) => s.type === item.metal)
    const price = getScrapPrice(item.content ?? 0, spot)

    return (
      <div
        key={index}
        className={`flex items-center justify-between w-full pl-5 gap-4 py-4 ${
          index !== items.length - 1 ? 'border-b border-neutral-300' : 'border-none'
        }`}
      >
        <div className="flex flex-col flex-grow">
          <div className="flex justify-between items-start w-full mt-2">
            <div className="flex flex-col">
              <div className="text-sm text-neutral-800">{item.name || 'Custom Scrap'}</div>
              <div className="flex items-center secondary-text gap-5"></div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-card p-0 pb-2"
              onClick={() => removeAll({ type: 'scrap', data: item })}
            >
              <Trash2 size={16} className="text-neutral-500" />
            </Button>
          </div>

          <div className="flex items-end">
            <div className="flex flex-col mr-auto gap-1">
              {getGrossLabel(item.pre_melt, item.gross_unit)}
              {getPurityLabel(item.purity, item.metal)}
            </div>

            <div className="ml-auto text-neutral-800 text-base">
              <PriceNumberFlow value={price} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const cartContent = (
    <div className="w-full flex-col">
      {productItems.length > 0 && (
        <div>{productItems.map((item, i) => renderProductItem(item.data as Product, i))}</div>
      )}
      {scrapItems.length > 0 && (
        <div>{scrapItems.map((item, i) => renderScrapItem(item.data as Scrap, i))}</div>
      )}
    </div>
  )

  const cartFooter = (
    <div className="w-full p-5 bg-card">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg text-neutral-800">Price Estimate</div>
        <div className="text-lg text-neutral-800">
          <PriceNumberFlow value={total} />
        </div>
      </div>
      <Button
        className="raised-off-page primary-gradient shine-on-hover w-full text-white"
        onClick={() => router.push('/checkout')}
      >
        Sell Your Items
      </Button>
    </div>
  )

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 pb-50">
        {items.length === 0 ? emptyCart : cartContent}
      </div>

      {items.length > 0 && <div className="sticky bottom-0 w-full bg-card z-10">{cartFooter}</div>}
    </>
  )
}
