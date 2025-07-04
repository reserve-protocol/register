import { z } from 'zod'

export const ProposeDaoSettingsSchema = z.object({
  // Governance fields
  daoVotingDelay: z.coerce.number().min(0).optional(),
  daoVotingPeriod: z.coerce.number().min(0).optional(),
  daoVotingQuorum: z.coerce.number().min(0).max(100).optional(),
  daoVotingThreshold: z.coerce.number().min(0).max(100).optional(),
  daoExecutionDelay: z.coerce.number().min(0).optional(),
})

export type ProposeDaoSettings = z.infer<typeof ProposeDaoSettingsSchema>