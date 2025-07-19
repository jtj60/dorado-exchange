import { z } from 'zod'

export type SpotPrice = {
  id: string
  purchase_order_id?: string
  sales_order_id?: string
  type: string
  ask_spot: number
  bid_spot: number
  percent_change: number
  dollar_change: number
  scrap_percentage: number
  created_at?: Date
  updated_at?: Date
}

export const spotPriceSchema = z.object({
  id: z.string(),
  purchase_order_id: z.string().optional(),
  sales_order_id: z.string().optional(),
  type: z.string(),
  ask_spot: z.number(),
  bid_spot: z.number(),
  percent_change: z.number(),
  dollar_change: z.number(),
  scrap_percentage: z.number(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
})
