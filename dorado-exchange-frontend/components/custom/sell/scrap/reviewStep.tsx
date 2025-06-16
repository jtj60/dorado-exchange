import { getGrossLabel, getPurityLabel, Scrap } from '@/types/scrap'
import { Anvil, CheckCircle, Percent, Scale } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import getScrapPrice from '@/utils/getScrapPrice'
import { convertTroyOz } from '@/utils/convertTroyOz'
import { useSpotPrices } from '@/lib/queries/useSpotPrices'
import PriceNumberFlow from '../../products/PriceNumberFlow'
import { BarbellIcon, CoinsIcon, PercentIcon, ScalesIcon } from '@phosphor-icons/react'
import getPrimaryIconStroke, { getCustomPrimaryIconStroke } from '@/utils/getPrimaryIconStroke'

export default function ReviewStep({ showBanner }: { showBanner: boolean }) {
  const form = useFormContext<Scrap>()
  const metal = form.watch('metal')
  const unit = form.watch('gross_unit') || 'g'
  const pre_melt = form.watch('pre_melt') ?? 0
  const purity = form.watch('purity') ?? 0

  const { data: spotPrices = [] } = useSpotPrices()

  const spot = spotPrices.find((s) => s.type === metal)
  const content = convertTroyOz(pre_melt, unit) * purity

  const price = getScrapPrice(content, spot)

  return (
    <AnimatePresence mode="wait">
      <div className="space-y-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CoinsIcon color={getPrimaryIconStroke()} size={24} />
              <span className="text-base text-neutral-600">Metal:</span>
            </div>
            <span className="text-lg text-neutral-800">{metal}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScalesIcon color={getPrimaryIconStroke()} size={24} />
              <span className="text-base text-neutral-600">Pre Melt:</span>
            </div>
            {getGrossLabel(pre_melt, unit)}
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <PercentIcon color={getPrimaryIconStroke()} size={24} />
              <span className="text-base text-neutral-600">Purity:</span>
            </div>
            {getPurityLabel(purity, metal)}
          </div>
        </div>

        <div className="separator-inset" />

        <div className="flex items-end justify-between">
          <span className="text-base text-neutral-800 ">Price Estimate:</span>
          <span className="text-xl text-neutral-900">
            <PriceNumberFlow value={price} />
          </span>
        </div>

        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 rounded-xl text-green-800 text-sm px-4 py-2 border border-green-800 mb-4 will-change-transform"
          >
            <CheckCircle className="w-4 h-4" />
            Item submitted!
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  )
}
