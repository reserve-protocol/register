import { isAddressNotStrict } from '@/views/index-dtf/deploy/utils'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { useMemo } from 'react'
import { z } from 'zod'

const messages = {
  onlyWholeNumbers: msg`Only whole numbers are allowed`,
  invalidAddress: msg`Invalid Address`,
  duplicatedGuardians: msg`Duplicated guardians`,
}

export const buildProposeDaoSettingsSchema = (
  t: (descriptor: MessageDescriptor) => string,
  quorumDenominator?: number
) =>
  z
    .object({
      // Governance fields
      daoVotingDelay: z.coerce.number().min(0).optional(),
      daoVotingPeriod: z.coerce.number().min(0).optional(),
      daoVotingQuorum: z.coerce
        .number()
        .min(0)
        .max(100)
        .optional()
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
      daoVotingThreshold: z.coerce.number().min(0).max(100).optional(),
      daoExecutionDelay: z.coerce.number().min(0).optional(),
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

export const useProposeDaoSettingsSchema = (quorumDenominator?: number) => {
  const { t } = useLingui()
  return useMemo(
    () => buildProposeDaoSettingsSchema(t, quorumDenominator),
    [t, quorumDenominator]
  )
}

export type ProposeDaoSettings = z.infer<
  ReturnType<typeof buildProposeDaoSettingsSchema>
>
