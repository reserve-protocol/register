import { isAddressNotStrict } from '@/views/index-dtf/deploy/utils'
import { Decimal } from '@/views/index-dtf/deploy/utils/decimals'
import { z } from 'zod'

export const ProposeSettingsSchema = z
  .object({
    mandate: z.string(),
    governanceVoteLock: z
      .string()
      .refine(isAddressNotStrict, { message: 'Invalid Address' })
      .optional(),

    governanceWalletAddress: z
      .string()
      .refine(isAddressNotStrict, { message: 'Invalid Address' })
      .optional(),
    folioFee: z.coerce
      .number()
      .min(0.15, 'Annualized TVL Fee must be 0.15% or greater')
      .max(10, 'Annualized TVL Fee must be 10% or less'),
    mintFee: z.coerce
      .number()
      .min(0.15, 'Mint Fee must be 0.15% or greater')
      .max(5, 'Mint Fee must be 5% or less'),
    governanceShare: z.coerce
      .number()
      .multipleOf(0.01, 'Max precision is 0.01%')
      .min(0)
      .max(100),
    deployerShare: z.coerce
      .number()
      .multipleOf(0.01, 'Max precision is 0.01%')
      .min(0)
      .max(100),
    fixedPlatformFee: z.coerce
      .number()
      .multipleOf(0.01, 'Max precision is 0.01%')
      .min(0)
      .max(100),
    additionalRevenueRecipients: z
      .array(
        z.object({
          address: z
            .string()
            .refine(isAddressNotStrict, { message: 'Invalid Address' }),
          share: z.coerce
            .number()
            .multipleOf(0.01, 'Max precision is 0.01%')
            .min(0)
            .max(100),
        })
      )
      .optional(),
    auctionLength: z.coerce
      .number()
      .min(0)
      .max(45, 'Auction length must not exceed 45 minutes'),
    // governanceVotingDelay: z.coerce.number().min(0),
    // governanceVotingPeriod: z.coerce.number().min(0),
    // governanceVotingQuorum: z.coerce.number().min(0).max(100),
    // governanceVotingThreshold: z.coerce.number().min(0).max(100),
    // governanceExecutionDelay: z.coerce.number().min(0),
    guardians: z.array(
      z
        .string()
        .refine((value) => !value || isAddressNotStrict(value), {
          message: 'Invalid Address',
        })
        .optional()
    ),
    brandManagers: z.array(
      z
        .string()
        .refine((value) => !value || isAddressNotStrict(value), {
          message: 'Invalid Address',
        })
        .optional()
    ),
    auctionLaunchers: z.array(
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
  .refine(
    (data) =>
      new Set(data.brandManagers?.map((item) => item?.toLowerCase() || item))
        .size === data.brandManagers.length,
    {
      message: 'Duplicated brand managers',
      path: ['roles'],
    }
  )
  .refine(
    (data) =>
      new Set(data.auctionLaunchers?.map((item) => item?.toLowerCase() || item))
        .size === data.auctionLaunchers.length,
    {
      message: 'Duplicated auction launchers',
      path: ['roles'],
    }
  )
  .refine(
    (data) => {
      const totalShares = [
        data.governanceShare,
        data.deployerShare,
        ...(data.additionalRevenueRecipients?.map((r) => r.share) || []),
      ]

      const total = totalShares.reduce(
        (sum, share) => sum.plus(new Decimal(share || 0)),
        new Decimal(0)
      )

      return total.plus(new Decimal(data.fixedPlatformFee)).eq(new Decimal(100))
    },
    (data) => {
      const totalShares = [
        data.governanceShare,
        data.deployerShare,
        ...(data.additionalRevenueRecipients?.map((r) => r.share) || []),
      ]

      const total = totalShares.reduce(
        (sum, share) => sum.plus(new Decimal(share || 0)),
        new Decimal(0)
      )

      const difference = new Decimal(100).minus(
        total.plus(new Decimal(data.fixedPlatformFee))
      )

      const absDifference = difference.abs()
      const displayDifference = absDifference.toDisplayString()

      return {
        message: `The sum of governance share, creator share, additional recipients shares and platform share must be 100% (${
          difference.isPositive()
            ? `${displayDifference}% missing`
            : `${displayDifference}% excess`
        })`,
        path: ['revenue-distribution'],
      }
    }
  )
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
      message: 'Duplicated additional recipients',
      path: ['revenue-distribution'],
    }
  )

export type ProposeSettings = z.infer<typeof ProposeSettingsSchema>
