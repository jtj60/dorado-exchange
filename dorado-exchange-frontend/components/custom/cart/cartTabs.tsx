'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Cart from './cart'
import SellCart from './sellCart'
import CartDrawer from '@/components/drawers/cartDrawer'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cartStore } from '@/store/cartStore'
import { sellCartStore } from '@/store/sellCartStore'
import { useCartTabStore } from '@/store/cartTabsStore'
import { useDrawerStore } from '@/store/drawerStore'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function CartTabs() {
  const { tab, setTab } = useCartTabStore()

  const items = cartStore((state) => state.items)
  const sellItems = sellCartStore((state) => state.items)

  const { activeDrawer, closeDrawer } = useDrawerStore()
  const isCartOpen = activeDrawer === 'cart'

  const pathname = usePathname()

  useEffect(() => {
    closeDrawer()
  }, [pathname, closeDrawer])

  return (
    <div>
      <CartDrawer open={isCartOpen} setOpen={closeDrawer}>
        <div className="h-full bg-card border-t-1 border-border lg:border-none flex flex-col p-2">
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex hover:bg-card p-3"
            onClick={closeDrawer}
          >
            <X size={24} className="text-neutral-900" />
          </Button>
          <Tabs
            defaultValue={tab}
            onValueChange={(val) => setTab(val as 'buy' | 'sell')}
            className="w-full h-full"
          >
            <div className="mx-5">
              <TabsList className="w-full gap-2 rounded-none border-b border-border bg-transparent py-1 mt-10">
                <TabsTrigger
                  value="buy"
                  className="cursor-pointer text-neutral-700 after:text-neutral-700 relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-secondary"
                >
                  Buy {`(${items.length})`}
                </TabsTrigger>
                <TabsTrigger
                  value="sell"
                  className="cursor-pointer text-neutral-700 after:text-neutral-700 relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
                >
                  Sell {`(${sellItems.length})`}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="buy">
              <Cart />
            </TabsContent>
            <TabsContent value="sell">
              <SellCart />
            </TabsContent>
          </Tabs>
        </div>
      </CartDrawer>
    </div>
  )
}
