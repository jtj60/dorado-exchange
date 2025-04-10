'use client'

import { useForm, FormProvider, useFormContext, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getGrossLabel, getPurityLabel, ScrapInput, scrapSchema, type Scrap } from '@/types/scrap'
import { Button } from '@/components/ui/button'
import { FloatingLabelInput } from '@/components/ui/floating-label-input'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { metalOptions, purityOptions, weightOptions } from '@/types/scrap'
import { useEffect, useState } from 'react'
import { defineStepper, Stepper } from '@stepperize/react'
import NumberFlow from '@number-flow/react'
import { sellCartStore } from '@/store/sellCartStore'
import { useRouter } from 'next/navigation'
import { useSpotPrices } from '@/lib/queries/useSpotPrices'
import getScrapPrice from '@/utils/getScrapPrice'
import { convertTroyOz } from '@/utils/convertTroyOz'
import { Anvil, CheckCircle, Percent, Scale } from 'lucide-react'
import PriceNumberFlow from '../../products/PriceNumberFlow'
import { motion, AnimatePresence } from 'framer-motion'

const { useStepper, utils } = defineStepper(
  // { id: 'name', title: 'Name', description: 'Enter Item name (necklace, ring, bracelet, grain, etc...' },
  { id: 'metalSelect', title: 'Metal Selection', description: 'Select item metal.' },
  { id: 'weightSelect', title: 'Weight Selection', description: 'Enter item weight.' },
  { id: 'puritySelect', title: 'Purity Selection', description: 'Select item purity.' },
  { id: 'review', title: 'Review', description: 'Review inputted item.' }
)

export default function ScrapFormStepper() {
  const [submitAction, setSubmitAction] = useState<'add' | 'checkout' | null>(null)

  const form = useForm<ScrapInput>({
    resolver: zodResolver(scrapSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      metal: 'Gold',
      gross: 0,
      gross_unit: 'g',
      purity: purityOptions['Gold'][0].value,
    },
  })

  const stepper = useStepper()
  const currentIndex = utils.getIndex(stepper.current.id)

  const addItem = sellCartStore.getState().addItem
  const { data: spotPrices = [] } = useSpotPrices()

  const [submitted, setSubmitted] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (showBanner) {
      const timeout = setTimeout(() => {
        setShowBanner(false)
      }, 5000)

      return () => clearTimeout(timeout)
    }
  }, [showBanner])

  const router = useRouter()

  const handleSubmit = (values: Scrap) => {
    const spot = spotPrices.find((s) => s.id === values.metal)
    const content =
      convertTroyOz(values.gross ?? 0, values.gross_unit ?? 'g') * (values.purity ?? 0)
    const price = getScrapPrice(content, spot)

    const item = {
      type: 'scrap' as const,
      data: {
        ...values,
        content,
        price,
      },
    }

    addItem(item)

    if (submitAction === 'checkout') {
      router.push('/sell/checkout')
    } else {
      setSubmitted(true)
      setShowBanner(true)
    }
    setSubmitAction(null)
  }

  const handleAddAnother = () => {
    form.reset({
      name: '',
      metal: 'Gold',
      gross: 0,
      gross_unit: 'g',
      purity: undefined,
    })
    setSubmitted(false)
    stepper.goTo('metalSelect')
  }

  const { errors } = useFormState({ control: form.control })
  const gross = form.watch('gross')
  const purity = form.watch('purity')

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 p-3 rounded-lg w-full mt-4"
        >
          <div className="flex items-center gap-4 mb-6">
            <StepIndicator currentStep={currentIndex + 1} totalSteps={stepper.all.length} />
            <div className="flex flex-col">
              <h2 className="flex-1 header-text">{stepper.current.title}</h2>
              <p className="secondary-text">{stepper.current.description}</p>
            </div>
          </div>

          {stepper.switch({
            metalSelect: () => <MetalSelectionStep />,
            weightSelect: () => <WeightStep />,
            puritySelect: () => <PurityStep />,
            review: () => <ReviewStep showBanner={showBanner} />,
          })}
          {stepper.current.id === 'review' ? (
            <div className="flex items-end gap-4">
              <div className="mr-auto">
                {submitted ? (
                  <Button type="button" variant="outline" onClick={handleAddAnother}>
                    Add Another
                  </Button>
                ) : (
                  <Button type="button" variant="outline" onClick={stepper.prev}>
                    Back
                  </Button>
                )}
              </div>

              <div className="ml-auto">
                <Button
                  className="w-full"
                  type="submit"
                  onClick={() => setSubmitAction(submitted ? 'checkout' : 'add')}
                >
                  {submitted ? 'Go to Checkout' : 'Submit Item'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={stepper.prev}
                disabled={stepper.isFirst}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={stepper.next}
                disabled={
                  stepper.current.id === 'weightSelect' &&
                  (!gross || !!errors.gross || gross === 0 || purity === 0)
                }
              >
                Next
              </Button>
            </div>
          )}
        </form>
      </Form>
    </FormProvider>
  )
}

function MetalSelectionStep() {
  const form = useFormContext<Scrap>()
  return (
    <FormField
      control={form.control}
      name="metal"
      render={({ field }) => (
        <FormItem>
          <RadioGroup
            defaultValue="0"
            value={field.value}
            onValueChange={(val) => {
              field.onChange(val)

              const defaultPurity = purityOptions[val as keyof typeof purityOptions]?.[0]?.value
              if (defaultPurity !== undefined) {
                form.setValue('purity', defaultPurity)
              }
            }}
            className="gap-3 w-full items-stretch flex flex-col"
          >
            {metalOptions.map((metal) => (
              <label
                key={metal.label}
                className="flex w-full items-stretch justify-between gap-4 rounded-lg p-3 cursor-pointer border border-text-neutral-200 has-[[data-state=checked]]:bg-card has-[[data-state=checked]]:shadow-xl has-[[data-state=checked]]:border-primary transition-colors"
              >
                <div className="flex gap-4 w-full items-center">
                  <div className="flex items-center">{metal.logo}</div>
                  <div className="flex flex-col gap-1">
                    <div className="title-text">{metal.label}</div>
                    <p className="tertiary-text leading-snug">{metal.blurb}</p>
                  </div>
                </div>
                <RadioGroupItem
                  value={metal.label}
                  id={metal.label}
                  className="sr-only after:absolute after:inset-0"
                />
              </label>
            ))}
          </RadioGroup>
        </FormItem>
      )}
    />
  )
}

function WeightStep() {
  const form = useFormContext<Scrap>()
  const unit = form.watch('gross_unit') || 'g'

  return (
    <div className="flex-col gap-4">
      <FormField
        control={form.control}
        name="gross_unit"
        render={({ field }) => (
          <FormItem className="mb-8">
            <RadioGroup
              defaultValue="0"
              value={field.value}
              onValueChange={field.onChange}
              className="gap-3 w-full flex"
            >
              {weightOptions.map((weight) => (
                <label
                  key={weight.id}
                  className="peer flex flex-col items-center w-full gap-3 rounded-lg py-3 cursor-pointer border border-text-neutral-200 has-[[data-state=checked]]:bg-card has-[[data-state=checked]]:shadow-xl has-[[data-state=checked]]:border-primary transition-colors"
                >
                  <div className="flex flex-col items-center gap-2">
                    {weight.logo}
                    <div className="secondary-text">{weight.label}</div>
                  </div>

                  <RadioGroupItem
                    value={weight.unit}
                    id={weight.id}
                    aria-describedby={weight.id}
                    className="sr-only after:absolute after:inset-0"
                  />
                </label>
              ))}
            </RadioGroup>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="gross"
        render={({ field }) => (
          <FormItem className="w-full">
            <div className="relative w-full rounded-lg">
              <FloatingLabelInput
                label="Enter Weight"
                type="text"
                size="sm"
                className="w-full input-floating-label-form no-spinner"
                value={field.value === 0 ? '' : field.value}
                onChange={(e) => {
                  const val = e.target.value
                  field.onChange(val === '' ? 0 : val)
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-transparent">
                {unit}
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

function PurityStep() {
  const form = useFormContext<Scrap>()

  const purity = form.watch('purity') ?? purityOptions[form.watch('metal')]?.[0]?.value
  const metal = form.watch('metal')

  const metalKey = metalOptions.find((m) => m.label === metal)?.label as keyof typeof purityOptions
  const options = purityOptions[metalKey] || []

  const isRoughlyEqual = (a: number, b: number) => Math.abs(a - b) < 0.001

  const matchedOption = options.find((opt) => isRoughlyEqual(opt.value, purity))
  const selectedLabel = matchedOption?.label ?? 'Custom'

  const handleRadioChange = (label: string) => {
    const match = options.find((opt) => opt.label === label)
    if (match) {
      form.setValue('purity', match.value)
    }
  }

  const handleSliderChange = (val: number) => {
    form.setValue('purity', val)
  }

  return (
    <FormField
      control={form.control}
      name="purity"
      render={() => (
        <FormItem>
          <RadioGroup
            value={selectedLabel}
            onValueChange={handleRadioChange}
            className="grid grid-cols-3 gap-3"
          >
            {options.map((option) => (
              <label
                key={option.label}
                className="flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium cursor-pointer has-[[data-state=checked]]:bg-card has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:shadow-lg transition-colors"
              >
                <RadioGroupItem
                  value={option.label}
                  id={option.label}
                  className="sr-only after:absolute after:inset-0"
                />
                {option.label}
              </label>
            ))}
          </RadioGroup>

          <div className="relative mt-12 mb-16 w-full">
            <Slider
              value={[purity]}
              onValueChange={([val]) => handleSliderChange(val)}
              min={0}
              max={1}
              step={0.01}
            />

            <div
              className="absolute top-6 text-sm text-muted-foreground"
              style={{
                left: `${purity * 100}%`,
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
              }}
            >
              <NumberFlow
                willChange
                value={Math.round(purity * 100)}
                isolate
                opacityTiming={{ duration: 250, easing: 'ease-out' }}
                transformTiming={{
                  easing: `linear(0, 0.0033 0.8%, 0.0263 2.39%, 0.0896 4.77%, 0.4676 15.12%, 0.5688, 0.6553, 0.7274, 0.7862, 0.8336 31.04%, 0.8793, 0.9132 38.99%, 0.9421 43.77%, 0.9642 49.34%, 0.9796 55.71%, 0.9893 62.87%, 0.9952 71.62%, 0.9983 82.76%, 0.9996 99.47%)`,
                  duration: 500,
                }}
                spinTiming={{ duration: 150, easing: 'ease-out' }}
                trend={0}
              />
              %
            </div>
          </div>
        </FormItem>
      )}
    />
  )
}

function ReviewStep({ showBanner }: { showBanner: boolean }) {
  const form = useFormContext<Scrap>()
  const metal = form.watch('metal')
  const unit = form.watch('gross_unit') || 'g'
  const gross = form.watch('gross') ?? 0
  const purity = form.watch('purity') ?? 0

  const { data: spotPrices = [] } = useSpotPrices()

  const spot = spotPrices.find((s) => s.type === metal)
  const content = convertTroyOz(gross, unit) * purity

  const price = getScrapPrice(content, spot)

  return (
    <AnimatePresence mode="wait">
      <div className="space-y-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Anvil className="text-primary" size={20} />
              <span className="text-base text-neutral-600">Metal:</span>
            </div>
            <span className="text-sm text-neutral-800">{metal}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="text-primary" size={20} />
              <span className="text-base text-neutral-600">Gross:</span>
            </div>
            {getGrossLabel(gross, unit)}
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Percent className="text-primary" size={20} />
              <span className="text-base text-neutral-600">Purity:</span>
            </div>
            {getPurityLabel(purity, metal)}
          </div>
        </div>

        <hr />

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Price Estimate:</span>
          <span className="text-neutral-800 text-lg">
            <PriceNumberFlow value={price} />
          </span>
        </div>

        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 rounded-xl text-green-800 text-sm px-4 py-2 border border-green-800 mb-4"
          >
            <CheckCircle className="w-4 h-4" />
            Item submitted!
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  )
}

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const size = 80
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const fillPercentage = (currentStep / totalSteps) * 100
  const dashOffset = circumference - (circumference * fillPercentage) / 100

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-neutral-500"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="text-primary transition-all duration-300 ease-in-out"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-medium" aria-live="polite">
          {currentStep} of {totalSteps}
        </span>
      </div>
    </div>
  )
}
