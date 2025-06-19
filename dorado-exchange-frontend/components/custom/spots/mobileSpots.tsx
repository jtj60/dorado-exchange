'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion'
import { wrap } from '@motionone/utils'
import { CaretUpIcon, CaretDownIcon } from '@phosphor-icons/react'
import { NumberFlowGroup } from '@number-flow/react'
import { useSpotPrices } from '@/lib/queries/useSpotPrices'
import PriceNumberFlow from '../products/PriceNumberFlow'
import getPrimaryIconStroke from '@/utils/getPrimaryIconStroke'

export default function MobileSpotTicker({ type }: { type: 'Bid' | 'Ask' }) {
  const { data: spots } = useSpotPrices()
  const baseX = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [wrapWidth, setWrapWidth] = useState(0)

  useEffect(() => {
    if (containerRef.current) {
      setWrapWidth(containerRef.current.offsetWidth / 3)
    }
  }, [spots])

  const x = useTransform(baseX, (v) => `${wrap(-wrapWidth, 0, v)}px`)

  useAnimationFrame((_, delta) => {
    const moveBy = -50 * (delta / 1000)
    baseX.set(baseX.get() + moveBy)
  })

  if (!spots) return null

  return (
    <div className="overflow-hidden w-full md:hidden">
      <motion.div
        ref={containerRef}
        className="flex items-end gap-8 w-max px-4 will-change-transform"
        style={{ x }}
      >
        {[...spots, ...spots, ...spots].map((spot, i) => {
          const trendUp = spot.dollar_change >= 0
          const CaretIcon = trendUp ? CaretUpIcon : CaretDownIcon

          return (
            <div key={`${spot.id}-${i}`} className="flex items-center gap-2">
              <span className="text-neutral-900 text-sm pb-[1px]">{spot.type}:</span>
              <NumberFlowGroup>
                <div className="text-sm flex items-center">
                  <PriceNumberFlow
                    value={type === 'Bid' ? spot.bid_spot : spot.ask_spot}
                    className="text-sm"
                  />
                </div>

                <div className="flex items-center text-xs gap-[0.5px] text-neutral-700 pt-[.5px]">
                  <CaretIcon size={14} color={getPrimaryIconStroke()} />
                  <PriceNumberFlow value={spot.dollar_change} />
                </div>
              </NumberFlowGroup>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}
