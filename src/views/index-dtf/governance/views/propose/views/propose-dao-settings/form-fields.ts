import { isAddressNotStrict } from '@/views/index-dtf/deploy/utils'
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
  // Role fields
  guardians: z.array(
    z
      .string()
      .refine((value) => !value || isAddressNotStrict(value), {
        message: 'Invalid Address',
      })
      .optional()
  ),
})
.refine(
  (data) =>
    new Set(data.guardians?.map((item) => item?.toLowerCase() || item))
      .size === data.guardians.length,
  {
    message: 'Duplicated guardians',
    path: ['roles'],
  }
)

// Default schema for backward compatibility
export const ProposeDaoSettingsSchema = createProposeDaoSettingsSchema()

export type ProposeDaoSettings = z.infer<typeof ProposeDaoSettingsSchema>