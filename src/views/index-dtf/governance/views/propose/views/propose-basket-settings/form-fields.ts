import { isAddressNotStrict } from '@/views/index-dtf/deploy/utils'
import { z } from 'zod'

export const createProposeBasketSettingsSchema = (quorumDenominator?: number) => z.object({
  basketVotingDelay: z
    .union([z.literal(''), z.string(), z.number()])
    .transform((val) => {
      if (val === '') return undefined
      return Number(val)
    })
    .refine((val) => val !== undefined, 'Voting delay is required')
    .refine(
      (val) => val === undefined || val >= 0,
      'Must be 0 or greater'
    ),
  basketVotingPeriod: z
    .union([z.literal(''), z.string(), z.number()])
    .transform((val) => {
      if (val === '') return undefined
      return Number(val)
    })
    .refine((val) => val !== undefined, 'Voting period is required')
    .refine(
      (val) => val === undefined || val >= 0,
      'Must be 0 or greater'
    ),
  basketVotingQuorum: z
    .union([z.literal(''), z.string(), z.number()])
    .transform((val) => {
      if (val === '') return undefined
      return Number(val)
    })
    .refine((val) => val !== undefined, 'Voting quorum is required')
    .refine(
      (val) => val === undefined || (val >= 0 && val <= 100),
      'Must be between 0 and 100'
    )
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
  basketVotingThreshold: z
    .union([z.literal(''), z.string(), z.number()])
    .transform((val) => {
      if (val === '') return undefined
      return Number(val)
    })
    .refine((val) => val !== undefined, 'Proposal threshold is required')
    .refine(
      (val) => val === undefined || (val >= 0 && val <= 100),
      'Must be between 0 and 100'
    ),
  basketExecutionDelay: z
    .union([z.literal(''), z.string(), z.number()])
    .transform((val) => {
      if (val === '') return undefined
      return Number(val)
    })
    .refine((val) => val !== undefined, 'Execution delay is required')
    .refine(
      (val) => val === undefined || val >= 0,
      'Must be 0 or greater'
    ),
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
export const ProposeBasketSettingsSchema = createProposeBasketSettingsSchema()

export type ProposeBasketSettings = z.infer<typeof ProposeBasketSettingsSchema>
