import { isAddressNotStrict } from '@/views/index-dtf/deploy/utils'
import { Decimal } from '@/views/index-dtf/deploy/utils/decimals'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { useMemo } from 'react'
import { z } from 'zod'

const messages = {
  tokenNameRequired: msg`Token name is required`,
  tokenNameMax: msg`Token name must be 32 characters or less`,
  invalidAddress: msg`Invalid Address`,
  tvlFeeMin: msg`Annualized TVL Fee must be 0.15% or greater`,
  tvlFeeMax: msg`Annualized TVL Fee must be 10% or less`,
  mintFeeMin: msg`Mint Fee must be 0.15% or greater`,
  mintFeeMax: msg`Mint Fee must be 5% or less`,
  maxPrecision: msg`Max precision is 0.01%`,
  auctionLengthMin: msg`Auction length must be at least 15 minutes`,
  auctionLengthMax: msg`Auction length must not exceed 1440 minutes (24 hours)`,
  onlyWholeNumbers: msg`Only whole numbers are allowed`,
  duplicatedGuardians: msg`Duplicated guardians`,
  duplicatedBrandManagers: msg`Duplicated brand managers`,
  duplicatedAuctionLaunchers: msg`Duplicated auction launchers`,
  duplicatedAdditionalRecipients: msg`Duplicated additional recipients`,
  duplicatedOptimisticProposers: msg`Duplicated optimistic proposers`,
}

type Translate = (descriptor: MessageDescriptor) => string

const revenueTotalMessage = (t: Translate, difference: Decimal) => {
  const displayDifference = difference.abs().toDisplayString()
  return difference.isPositive()
    ? t(
        msg`The sum of governance share, creator share, additional recipients shares and platform share must be 100% (${displayDifference}% missing)`
      )
    : t(
        msg`The sum of governance share, creator share, additional recipients shares and platform share must be 100% (${displayDifference}% excess)`
      )
}

export const buildProposeSettingsSchema = (
  t: Translate,
  quorumDenominator?: number
) =>
  z
    .object({
      tokenName: z
        .string()
        .min(1, t(messages.tokenNameRequired))
        .max(32, t(messages.tokenNameMax)),
      mandate: z.string(),
      governanceVoteLock: z
        .string()
        .refine(isAddressNotStrict, { message: t(messages.invalidAddress) })
        .optional(),
      governanceWalletAddress: z
        .string()
        .refine(isAddressNotStrict, { message: t(messages.invalidAddress) })
        .optional(),
      folioFee: z.coerce
        .number()
        .min(0.15, t(messages.tvlFeeMin))
        .max(10, t(messages.tvlFeeMax)),
      mintFee: z.coerce
        .number()
        .min(0.15, t(messages.mintFeeMin))
        .max(5, t(messages.mintFeeMax)),
      governanceShare: z.coerce
        .number()
        .multipleOf(0.01, t(messages.maxPrecision))
        .min(0)
        .max(100),
      deployerShare: z.coerce
        .number()
        .multipleOf(0.01, t(messages.maxPrecision))
        .min(0)
        .max(100),
      fixedPlatformFee: z.coerce
        .number()
        .multipleOf(0.01, t(messages.maxPrecision))
        .min(0)
        .max(100),
      additionalRevenueRecipients: z
        .array(
          z.object({
            address: z.string().refine(isAddressNotStrict, {
              message: t(messages.invalidAddress),
            }),
            share: z.coerce
              .number()
              .multipleOf(0.01, t(messages.maxPrecision))
              .min(0)
              .max(100),
          })
        )
        .optional(),
      auctionLength: z.coerce
        .number()
        .min(15, t(messages.auctionLengthMin))
        .max(1440, t(messages.auctionLengthMax)),
      weightControl: z.boolean(),
      bidsEnabled: z.boolean(),
      governanceVotingDelay: z.coerce.number().min(0).optional(),
      governanceVotingPeriod: z.coerce.number().min(0).optional(),
      governanceVotingQuorum: z.coerce
        .number()
        .min(0)
        .max(100)
        .optional()
        .refine((val) => {
          // Only validate if we have a denominator and a value
          if (quorumDenominator === 100 && val !== undefined) {
            return Number.isInteger(val)
          }
          return true
        }, t(messages.onlyWholeNumbers)),
      governanceVotingThreshold: z.coerce.number().min(0).max(100).optional(),
      governanceExecutionDelay: z.coerce.number().min(0).optional(),
      optimisticVetoDelay: z.coerce.number().min(0).optional(),
      optimisticVetoPeriod: z.coerce.number().min(0).optional(),
      optimisticVetoThreshold: z.coerce.number().min(0).max(100).optional(),
      optimisticProposers: z
        .array(
          z
            .string()
            .refine((value) => !value || isAddressNotStrict(value), {
              message: t(messages.invalidAddress),
            })
            .optional()
        )
        .default([]),
      optimisticActions: z.array(z.string()).optional(),
      guardians: z.array(
        z
          .string()
          .refine((value) => !value || isAddressNotStrict(value), {
            message: t(messages.invalidAddress),
          })
          .optional()
      ),
      brandManagers: z.array(
        z
          .string()
          .refine((value) => !value || isAddressNotStrict(value), {
            message: t(messages.invalidAddress),
          })
          .optional()
      ),
      auctionLaunchers: z.array(
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
    .refine(
      (data) =>
        new Set(data.brandManagers?.map((item) => item?.toLowerCase() || item))
          .size === data.brandManagers.length,
      {
        message: t(messages.duplicatedBrandManagers),
        path: ['roles'],
      }
    )
    .refine(
      (data) =>
        new Set(
          data.auctionLaunchers?.map((item) => item?.toLowerCase() || item)
        ).size === data.auctionLaunchers.length,
      {
        message: t(messages.duplicatedAuctionLaunchers),
        path: ['roles'],
      }
    )
    .refine(
      (data) =>
        new Set(
          data.optimisticProposers?.map((item) => item?.toLowerCase() || item)
        ).size === (data.optimisticProposers?.length ?? 0),
      {
        message: t(messages.duplicatedOptimisticProposers),
        path: ['optimistic'],
      }
    )
    .superRefine((data, ctx) => {
      const totalShares = [
        data.governanceShare,
        data.deployerShare,
        ...(data.additionalRevenueRecipients?.map((r) => r.share) || []),
      ]

      const total = totalShares.reduce(
        (sum, share) => sum.plus(new Decimal(share || 0)),
        new Decimal(0)
      )

      if (
        !total.plus(new Decimal(data.fixedPlatformFee)).eq(new Decimal(100))
      ) {
        const difference = new Decimal(100).minus(
          total.plus(new Decimal(data.fixedPlatformFee))
        )

        ctx.addIssue({
          code: 'custom',
          message: revenueTotalMessage(t, difference),
          path: ['revenue-distribution'],
        })
      }
    })
    .refine(
      (data) => {
        const governanceAddresses = [
          ...(data.governanceVoteLock
            ? [data.governanceVoteLock.toLowerCase()]
            : []),
          ...(data.governanceWalletAddress
            ? [data.governanceWalletAddress.toLowerCase()]
            : []),
        ]
        return (
          new Set([
            ...(data.additionalRevenueRecipients?.map(
              (item) => item?.address?.toLowerCase() || item?.address
            ) || []),
            ...governanceAddresses,
          ]).size ===
          (data.additionalRevenueRecipients?.length || 0) +
            governanceAddresses.length
        )
      },
      {
        message: t(messages.duplicatedAdditionalRecipients),
        path: ['revenue-distribution'],
      }
    )

export const useProposeSettingsSchema = (quorumDenominator?: number) => {
  const { t } = useLingui()
  return useMemo(
    () => buildProposeSettingsSchema(t, quorumDenominator),
    [t, quorumDenominator]
  )
}

export type ProposeSettings = z.infer<
  ReturnType<typeof buildProposeSettingsSchema>
>
