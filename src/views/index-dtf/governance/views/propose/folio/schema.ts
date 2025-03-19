import { isAddressNotStrict } from '@/views/index-dtf/deploy/utils'
import { Decimal } from '@/views/index-dtf/deploy/utils/decimals'
import { z } from 'zod'

export type GovernanceStepId =
  | 'metadata'
  | 'revenue-distribution'
  | 'auctions'
  | 'roles'

export const dtfGovernanceSteps: Record<
  GovernanceStepId,
  { fields: string[] }
> = {
  metadata: {
    fields: ['mandate'],
  },
  'revenue-distribution': {
    fields: [
      'folioFee',
      'mintFee',
      'governanceShare',
      'deployerShare',
      'fixedPlatformFee',
      'additionalRevenueRecipients',
    ],
  },
  auctions: {
    fields: ['auctionLength', 'auctionDelay'],
  },
  roles: {
    fields: ['brandManagers', 'auctionLaunchers'],
  },
}

export const GovernanceFormSchema = z
  .object({
    mandate: z.string().optional(),
    folioFee: z.coerce
      .number()
      .min(0.15, 'Annualized TVL Fee fee must be 0.15% or greater')
      .max(10, 'Annualized TVL Fee fee must be 10% or less'),
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
    auctionLength: z.coerce.number().min(0).max(10080),
    auctionDelay: z.coerce.number().min(0).max(10080),
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
// TODO: Revisit duplicated additional recipients
// .refine(
//   (data) => {
//     const governanceAddresses = [
//       ...(data.governanceERC20address
//         ? [data.governanceERC20address.toLowerCase()]
//         : []),
//       ...(data.governanceVoteLock
//         ? [data.governanceVoteLock.toLowerCase()]
//         : []),
//       ...(data.governanceWalletAddress
//         ? [data.governanceWalletAddress.toLowerCase()]
//         : []),
//     ]
//     return (
//       new Set([
//         ...(data.additionalRevenueRecipients?.map(
//           (item) => item?.address?.toLowerCase() || item?.address
//         ) || []),
//         ...governanceAddresses,
//       ]).size ===
//       (data.additionalRevenueRecipients?.length || 0) +
//         governanceAddresses.length
//     )
//   },
//   {
//     message: 'Duplicated additional recipients',
//     path: ['revenue-distribution'],
//   }
// )

export const dtfGovernanceDefaultValues = {
  mandate: '',
  folioFee: 1,
  mintFee: 0.5,
  governanceShare: 0,
  deployerShare: 0,
  fixedPlatformFee: 50,
  additionalRevenueRecipients: [],
  auctionLength: 30,
  auctionDelay: 12,
  brandManagers: [],
  auctionLaunchers: [],
}

export type GovernanceInputs = z.infer<typeof GovernanceFormSchema>
