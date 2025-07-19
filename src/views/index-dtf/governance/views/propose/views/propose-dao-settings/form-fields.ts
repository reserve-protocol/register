import { z } from 'zod'

export const createProposeDaoSettingsSchema = (quorumDenominator?: number) => z.object({
  // Governance fields
  daoVotingDelay: z.coerce.number().min(0).optional(),
  daoVotingPeriod: z.coerce.number().min(0).optional(),
  daoVotingQuorum: z.coerce.number().min(0).max(100).optional()
    .refine(
      (val) => {
        // Only validate if we have a denominator and a value
        if (quorumDenominator === 100 && val !== undefined) {
          return Number.isInteger(val)
        }
        return true
      },
      'Only whole numbers are allowed'
    ),
  daoVotingThreshold: z.coerce.number().min(0).max(100).optional(),
  daoExecutionDelay: z.coerce.number().min(0).optional(),
})

// Default schema for backward compatibility
export const ProposeDaoSettingsSchema = createProposeDaoSettingsSchema()

export type ProposeDaoSettings = z.infer<typeof ProposeDaoSettingsSchema>