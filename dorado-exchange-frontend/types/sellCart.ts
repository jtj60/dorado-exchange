import { Product, productSchema } from '@/types/product'
import { Scrap, scrapSchema } from '@/types/scrap'
import { z } from 'zod';

export type SellCartItem =
  | { type: 'product'; data: Product & { quantity?: number } }
  | { type: 'scrap'; data: Scrap & { quantity?: number } }

  export const sellCartItemSchema = z.union([
    z.object({
      type: z.literal('product'),
      data: productSchema,
    }),
    z.object({
      type: z.literal('scrap'),
      data: scrapSchema,
    }),
  ])