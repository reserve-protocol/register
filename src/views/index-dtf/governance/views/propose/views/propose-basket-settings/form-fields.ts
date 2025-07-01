import { z } from 'zod'

export const ProposeBasketSettingsSchema = z.object({
  basketVotingDelay: z.coerce.number().min(0).optional(),
  basketVotingPeriod: z.coerce.number().min(0).optional(),
  basketVotingQuorum: z.coerce.number().min(0).max(100).optional(),
  basketVotingThreshold: z.coerce.number().min(0).max(100).optional(),
  basketExecutionDelay: z.coerce.number().min(0).optional(),
})

export type ProposeBasketSettings = z.infer<typeof ProposeBasketSettingsSchema>