'use client'

import { Address } from '@/types/address'
import { AddressSelector } from './addressSelector'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { PackageSelector } from './packageSelector'
import { FedexPickupTimesInput, formatFedexPickupAddress, FedexRate } from '@/types/shipping'
import { useFedExPickupTimes } from '@/lib/queries/shipping/useFedex'
import { ServiceSelector } from './serviceSelector'
import { usePurchaseOrderCheckoutStore } from '@/store/purchaseOrderCheckoutStore'
import { PickupSelector } from './pickupSelector'
import PickupScheduler from './pickupScheduler'
import { FedexLocationsMap } from './FedexLocations'
import { InsuranceSelector } from './insuranceSelector'
import AddressDrawer from '../../user/addresses/addressDrawer'
import { useDrawerStore } from '@/store/drawerStore'

interface ShippingStepProps {
  addresses: Address[]
  emptyAddress: Address
  rates: FedexRate[]
  isLoading: boolean
}

export default function ShippingStep({
  addresses,
  emptyAddress,
  rates,
  isLoading,
}: ShippingStepProps) {
  const [draftAddress, setDraftAddress] = useState<Address>(emptyAddress)
  const { openDrawer } = useDrawerStore()

  const isEmpty = addresses.length === 0

  const address = usePurchaseOrderCheckoutStore((state) => state.data.address)
  const pkg = usePurchaseOrderCheckoutStore((state) => state.data.package)
  const service = usePurchaseOrderCheckoutStore((state) => state.data.service)
  const pickup = usePurchaseOrderCheckoutStore((state) => state.data.pickup)
  const setData = usePurchaseOrderCheckoutStore((state) => state.setData)

  let fedexPickupTimesInput: FedexPickupTimesInput | null = null
  if (address?.is_valid && service) {
    fedexPickupTimesInput = {
      customerAddress: formatFedexPickupAddress(address),
      code: service.code,
    }
  }

  const { data: times = [] } = useFedExPickupTimes(fedexPickupTimesInput)

  return (
    <div className="space-y-6 w-full">
      <AddressDrawer
        address={draftAddress}
        onSuccess={(savedAddress: Address) => {
          setData({ address: savedAddress })
        }}
      />

      {isEmpty ? (
        <div className="flex flex-col items-center gap-4">
          <div className="text-center text-lg text-neutral-800">
            Create an address to continue checkout.
          </div>
          <Button
            type="button"
            effect="expandIcon"
            variant="outline"
            size="sm"
            iconPlacement="right"
            icon={Plus}
            iconSize={16}
            onClick={() => {
              setDraftAddress(emptyAddress)
              openDrawer('address')
            }}
            className="border-primary text-primary hover:text-neutral-900 hover:bg-primary"
          >
            <div className="flex items-center gap-2">Add Address</div>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="flex ml-auto h-auto min-h-0 font-normal text-neutral-700 border-none hover:bg-background p-0"
            onClick={() => {
              setDraftAddress(emptyAddress)
              openDrawer('address')
            }}
          >
            <div className="flex text-xs items-center gap-1">
              Add New Address
              <Plus size={16} className="" />
            </div>
          </Button>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              <AddressSelector
                addresses={addresses}
                setDraftAddress={setDraftAddress}
                emptyAddress={emptyAddress}
              />
              {address && !address.is_valid && (
                <div className="text-sm text-destructive rounded-md">
                  Please provide a valid address to continue checkout.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="separator-inset" />

      {address?.is_valid && (
        <>
          <InsuranceSelector />
          <div className="separator-inset" />

          <PackageSelector />
          <div className="separator-inset" />
        </>
      )}

      {address?.is_valid && pkg?.dimensions && pkg?.weight?.value !== undefined && (
        <>
          <ServiceSelector rates={rates} isLoading={isLoading} />
          <div className="separator-inset" />
        </>
      )}

      {address?.is_valid && pkg && service && (
        <>
          <PickupSelector />
          <div className="separator-inset" />
        </>
      )}
      {address?.is_valid &&
        pkg &&
        service &&
        pickup?.label &&
        (pickup.label === 'DROPOFF_AT_FEDEX_LOCATION' ||
          pickup.label === 'CONTACT_FEDEX_TO_SCHEDULE') && (
          <div>
            {pickup.label === 'CONTACT_FEDEX_TO_SCHEDULE' ? (
              times.length > 0 ? (
                <PickupScheduler times={times} />
              ) : (
                <div className="text-sm text-muted-foreground py-4">No pickup times available.</div>
              )
            ) : (
              <FedexLocationsMap />
            )}
          </div>
        )}
    </div>
  )
}
