import * as z from 'zod'

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email().min(1, 'Email is required'),
  name: z.string().min(1, 'Name is required'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  emailVerified: z.boolean().optional(),
  image: z.string().url().nullable().optional(),
  role: z.string().optional(),
  stripeCustomerId: z.string().nullable().optional(),
  dorado_funds: z.number().optional().nullable(),
})

export type User = z.infer<typeof userSchema>
