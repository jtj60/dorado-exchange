import { pdfRequest } from '@/utils/axiosInstance'
import { PurchaseOrder } from '@/types/purchase-order'
import { useFormatPurchaseOrderNumber } from '@/utils/formatPurchaseOrderNumber'
import { useMutation } from '@tanstack/react-query'
import { SpotPrice } from '@/types/metal'
import { PackageOption } from '@/types/packaging'
import { PayoutMethod } from '@/types/payout'

const downloadPackingListRequest = async ({
  purchaseOrder,
  spotPrices,
  packageDetails,
  payoutDetails,
}: {
  purchaseOrder: PurchaseOrder
  spotPrices: SpotPrice[]
  packageDetails: PackageOption
  payoutDetails: PayoutMethod
}) => {
  const blob = await pdfRequest<Blob>('POST', '/pdf/generate_packing_list', {
    purchaseOrder,
    spotPrices,
    packageDetails,
    payoutDetails,
  })

  const url = URL.createObjectURL(blob)
  const { formatPurchaseOrderNumber } = useFormatPurchaseOrderNumber()
  const link = document.createElement('a')
  link.href = url
  link.download = `${formatPurchaseOrderNumber(purchaseOrder.order_number)}_packing_list.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const useDownloadPackingList = () => {
  return useMutation({
    mutationFn: downloadPackingListRequest,
  })
}

const downloadReturnPackingListRequest = async ({
  purchaseOrder,
  spotPrices,
}: {
  purchaseOrder: PurchaseOrder
  spotPrices: SpotPrice[]
}) => {
  const blob = await pdfRequest<Blob>('POST', '/pdf/generate_return_packing_list', {
    purchaseOrder,
    spotPrices,
  })

  const url = URL.createObjectURL(blob)
  const { formatPurchaseOrderNumber } = useFormatPurchaseOrderNumber()
  const link = document.createElement('a')
  link.href = url
  link.download = `${formatPurchaseOrderNumber(purchaseOrder.order_number)}_return_packing_list.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const useDownloadReturnPackingList = () => {
  return useMutation({
    mutationFn: downloadReturnPackingListRequest,
  })
}

const downloadInvoiceRequest = async ({
  purchaseOrder,
  spotPrices,
  orderSpots,
  fileName,
}: {
  purchaseOrder: PurchaseOrder
  spotPrices: SpotPrice[]
  orderSpots: SpotPrice[]
  fileName: string
}) => {
  const blob = await pdfRequest<Blob>('POST', '/pdf/generate_invoice', {
    purchaseOrder,
    spotPrices,
    orderSpots,
  })

  const url = URL.createObjectURL(blob)
  const { formatPurchaseOrderNumber } = useFormatPurchaseOrderNumber()
  const link = document.createElement('a')
  link.href = url
  link.download = `${formatPurchaseOrderNumber(purchaseOrder.order_number)}_${fileName}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: downloadInvoiceRequest,
  })
}
