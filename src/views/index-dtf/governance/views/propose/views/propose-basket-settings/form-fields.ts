import { isAddressNotStrict } from '@/views/index-dtf/deploy/utils'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { useMemo } from 'react'
import { z } from 'zod'

const messages = {
  votingDelayRequired: msg`Voting delay is required`,
  votingPeriodRequired: msg`Voting period is required`,
  votingQuorumRequired: msg`Voting quorum is required`,
  proposalThresholdRequired: msg`Proposal threshold is required`,
  executionDelayRequired: msg`Execution delay is required`,
  mustBeZeroOrGreater: msg`Must be 0 or greater`,
  mustBeBetween0And100: msg`Must be between 0 and 100`,
  onlyWholeNumbers: msg`Only whole numbers are allowed`,
  invalidAddress: msg`Invalid Address`,
  duplicatedGuardians: msg`Duplicated guardians`,
}

export const buildProposeBasketSettingsSchema = (
  t: (descriptor: MessageDescriptor) => string,
  quorumDenominator?: number
) =>
  z
    .object({
      basketVotingDelay: z
        .union([z.literal(''), z.string(), z.number()])
        .transform((val) => {
          if (val === '') return undefined
          return Number(val)
        })
        .refine((val) => val !== undefined, t(messages.votingDelayRequired))
        .refine(
          (val) => val === undefined || val >= 0,
          t(messages.mustBeZeroOrGreater)
        ),
      basketVotingPeriod: z
        .union([z.literal(''), z.string(), z.number()])
        .transform((val) => {
          if (val === '') return undefined
          return Number(val)
        })
        .refine((val) => val !== undefined, t(messages.votingPeriodRequired))
        .refine(
          (val) => val === undefined || val >= 0,
          t(messages.mustBeZeroOrGreater)
        ),
      basketVotingQuorum: z
        .union([z.literal(''), z.string(), z.number()])
        .transform((val) => {
          if (val === '') return undefined
          return Number(val)
        })
        .refine((val) => val !== undefined, t(messages.votingQuorumRequired))
        .refine(
          (val) => val === undefined || (val >= 0 && val <= 100),
          t(messages.mustBeBetween0And100)
        )
        .refine(
          (val) => {
            // Only validate if we have a denominator and a value
            if (quorumDenominator === 100 && val !== undefined) {
              return Number.isInteger(val)
            }
            return true
          },
          t(messages.onlyWholeNumbers)
        ),
      basketVotingThreshold: z
        .union([z.literal(''), z.string(), z.number()])
        .transform((val) => {
          if (val === '') return undefined
          return Number(val)
        })
        .refine(
          (val) => val !== undefined,
          t(messages.proposalThresholdRequired)
        )
        .refine(
          (val) => val === undefined || (val >= 0 && val <= 100),
          t(messages.mustBeBetween0And100)
        ),
      basketExecutionDelay: z
        .union([z.literal(''), z.string(), z.number()])
        .transform((val) => {
          if (val === '') return undefined
          return Number(val)
        })
        .refine((val) => val !== undefined, t(messages.executionDelayRequired))
        .refine(
          (val) => val === undefined || val >= 0,
          t(messages.mustBeZeroOrGreater)
        ),
      // Role fields
      guardians: z.array(
        z
          .string()
          .refine((value) => !value || isAddressNotStrict(value), {
            message: t(messages.invalidAddress),
          })
          .optional()
      ),
    })
    .refine(
      (data) =>
        new Set(data.guardians?.map((item) => item?.toLowerCase() || item))
          .size === data.guardians.length,
      {
        message: t(messages.duplicatedGuardians),
        path: ['roles'],
      }
    )

export const useProposeBasketSettingsSchema = (quorumDenominator?: number) => {
  const { t } = useLingui()
  return useMemo(
    () => buildProposeBasketSettingsSchema(t, quorumDenominator),
    [t, quorumDenominator]
  )
}

export type ProposeBasketSettings = z.infer<
  ReturnType<typeof buildProposeBasketSettingsSchema>
>
