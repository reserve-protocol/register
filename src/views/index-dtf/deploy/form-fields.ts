import { isAddress } from 'viem'
import { z } from 'zod'
import {
  isERC20,
  isNotStRSR,
  isNotVoteLockAddress,
  isVoteLockAddress,
  noSpecialCharacters,
} from './utils'
import { Decimal } from './utils/decimals'
import { ChainId } from '@/utils/chains'

export type DeployStepId =
  | 'metadata'
  | 'basket'
  | 'governance'
  | 'revenue-distribution'
  | 'auctions'
  | 'roles'
  | 'basket-changes'
  | 'other-changes'

export const dtfDeploySteps: Record<DeployStepId, { fields: string[] }> = {
  metadata: {
    fields: ['tokenName', 'symbol', 'mandate', 'chain'],
  },
  basket: {
    fields: ['initialValue', 'tokensDistribution'],
  },
  governance: {
    fields: [
      'governanceERC20address',
      'governanceVoteLock',
      'governanceWalletAddress',
    ],
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
    fields: ['guardians', 'brandManagers', 'auctionLaunchers'],
  },
  'basket-changes': {
    fields: [
      'basketVotingDelay',
      'basketVotingPeriod',
      'basketVotingThreshold',
      'basketVotingQuorum',
      'basketExecutionDelay',
    ],
  },
  'other-changes': {
    fields: [
      'governanceVotingDelay',
      'governanceVotingPeriod',
      'governanceVotingThreshold',
      'governanceVotingQuorum',
      'governanceExecutionDelay',
    ],
  },
}

export const DeployFormSchema = z
  .object({
    tokenName: z
      .string()
      .min(1, 'Token name is required')
      .max(80, 'Token name must be 80 characters or less')
      .refine(noSpecialCharacters, {
        message: 'Token name cannot contain special characters or emojis',
      }),
    symbol: z
      .string()
      .min(1, 'Token symbol is required')
      .max(12, 'Token symbol must be 12 characters or less')
      .refine((value) => !value.includes(' '), {
        message: 'Token symbol cannot contain spaces',
      })
      .refine(noSpecialCharacters, {
        message: 'Token symbol cannot contain special characters or emojis',
      }),
    mandate: z.string().optional(),
    chain: z
      .number()
      .refine((value) => value === ChainId.Mainnet || value === ChainId.Base, {
        message: 'Chain must be either Mainnet or Base',
      }),
    initialValue: z.coerce.number().positive('Initial value must be positive'),
    tokensDistribution: z.array(
      z.object({
        address: z.string().refine(isAddress, { message: 'Invalid Address' }),
        percentage: z.coerce
          .number()
          .multipleOf(0.01, 'Max precision is 0.01%')
          .positive('Token distribution must be positive'),
      })
    ),
    governanceVoteLock: z
      .string()
      .refine(isAddress, { message: 'Invalid Address' })
      .optional(),
    governanceERC20address: z
      .string()
      .refine(isAddress, { message: 'Invalid Address' })
      .optional(),
    governanceWalletAddress: z
      .string()
      .refine(isAddress, { message: 'Invalid Address' })
      .optional(),
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
          address: z.string().refine(isAddress, { message: 'Invalid Address' }),
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
    guardians: z.array(
      z
        .string()
        .refine((value) => !value || isAddress(value), {
          message: 'Invalid Address',
        })
        .optional()
    ),
    brandManagers: z.array(
      z
        .string()
        .refine((value) => !value || isAddress(value), {
          message: 'Invalid Address',
        })
        .optional()
    ),
    auctionLaunchers: z.array(
      z
        .string()
        .refine((value) => !value || isAddress(value), {
          message: 'Invalid Address',
        })
        .optional()
    ),
    basketVotingDelay: z.coerce.number().min(0),
    basketVotingPeriod: z.coerce.number().min(0),
    basketVotingQuorum: z.coerce.number().min(0).max(100),
    basketVotingThreshold: z.coerce.number().min(0).max(100),
    basketExecutionDelay: z.coerce.number().min(0),
    governanceVotingDelay: z.coerce.number().min(0),
    governanceVotingPeriod: z.coerce.number().min(0),
    governanceVotingQuorum: z.coerce.number().min(0).max(100),
    governanceVotingThreshold: z.coerce.number().min(0).max(100),
    governanceExecutionDelay: z.coerce.number().min(0),
  })
  .refine(
    (data) =>
      !data.governanceERC20address ||
      isERC20(data.governanceERC20address, data.chain),
    {
      message: 'Invalid ERC20 address',
      path: ['governanceERC20address'],
    }
  )
  .refine(
    (data) =>
      !data.governanceERC20address ||
      isNotVoteLockAddress(data.governanceERC20address, data.chain),
    {
      message: 'Vote Lock address is not allowed for new DAO',
      path: ['governanceERC20address'],
    }
  )
  .refine(
    (data) =>
      !data.governanceVoteLock ||
      isNotStRSR(data.governanceVoteLock, data.chain),
    {
      message: 'stRSR DAO contracts for Index DTFs are not supported',
      path: ['governanceVoteLock'],
    }
  )
  .refine(
    (data) =>
      !data.governanceVoteLock ||
      isVoteLockAddress(data.governanceVoteLock, data.chain),
    {
      message: 'Unsupported Vote Lock Address',
      path: ['governanceVoteLock'],
    }
  )
  .refine(
    (data) => {
      const total = data.tokensDistribution?.reduce(
        (sum, { percentage }) => sum.plus(new Decimal(percentage)),
        new Decimal(0)
      )
      return total.eq(new Decimal(100))
    },
    (data) => {
      const total =
        data.tokensDistribution?.reduce(
          (sum, { percentage }) => sum.plus(new Decimal(percentage)),
          new Decimal(0)
        ) || new Decimal(0)
      const difference = new Decimal(100).minus(total)

      const absDifference = difference.abs()
      const displayDifference = absDifference.toDisplayString()

      return {
        message: `The sum of the tokens distribution must be 100% (${
          difference.isPositive()
            ? `${displayDifference}% missing`
            : `${displayDifference}% excess`
        }).`,
        path: ['basket'],
      }
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
      // Check if the governance settings are valid
      const governanceExistingERC20 = data.governanceERC20address
      const governanceExistingVoteLock = data.governanceVoteLock
      const governanceWallet = data.governanceWalletAddress

      return (
        (governanceExistingVoteLock &&
          !governanceExistingERC20 &&
          !governanceWallet) ||
        (!governanceExistingVoteLock &&
          governanceExistingERC20 &&
          !governanceWallet) ||
        (!governanceExistingVoteLock &&
          !governanceExistingERC20 &&
          governanceWallet)
      )
    },
    { message: 'Invalid governance settings', path: ['governance'] }
  )
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

export const dtfDeployDefaultValues = {
  tokenName: '',
  symbol: '',
  mandate: '',
  chain: ChainId.Base,
  initialValue: 1,
  tokensDistribution: [],
  governanceERC20address: undefined,
  governanceVoteLock: undefined,
  governanceWalletAddress: undefined,
  folioFee: 1,
  mintFee: 0.5,
  governanceShare: 0,
  deployerShare: 0,
  fixedPlatformFee: 50,
  additionalRevenueRecipients: [],
  auctionLength: 30,
  auctionDelay: 12,
  guardians: [],
  brandManagers: [],
  auctionLaunchers: [],
  basketVotingDelay: 48,
  basketVotingPeriod: 48,
  basketVotingThreshold: 0.01,
  basketVotingQuorum: 10,
  basketExecutionDelay: 48,
  governanceVotingDelay: 2,
  governanceVotingPeriod: 2,
  governanceVotingThreshold: 0.01,
  governanceVotingQuorum: 10,
  governanceExecutionDelay: 2,
}

export type DeployInputs = z.infer<typeof DeployFormSchema>
