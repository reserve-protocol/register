import { isAddress } from 'viem'
import { z } from 'zod'
import {
  isERC20,
  isNotStRSR,
  noSpecialCharacters,
  isVoteLockAddress,
} from './utils'
import { Decimal } from './utils/decimals'

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
    fields: ['tokenName', 'symbol', 'mandate'],
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
      'basketVotingQuorum',
      'basketExecutionDelay',
    ],
  },
  'other-changes': {
    fields: [
      'governanceVotingDelay',
      'governanceVotingPeriod',
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
    initialValue: z.coerce.number().positive('Initial value must be positive'),
    tokensDistribution: z.array(
      z.object({
        address: z.string().refine(isAddress, { message: 'Invalid Address' }),
        percentage: z.coerce
          .number()
          .positive('Token distribution must be positive'),
      })
    ),
    governanceVoteLock: z
      .string()
      .refine(isAddress, { message: 'Invalid Address' })
      .refine(isNotStRSR, {
        message: 'stRSR DAO contracts for Yield DTFs are not supported',
      })
      .refine(isVoteLockAddress, { message: 'Unsupported Vote Lock Address' })
      .optional(),
    governanceERC20address: z
      .string()
      .refine(isAddress, { message: 'Invalid Address' })
      .refine(isERC20, { message: 'Invalid ERC20 address' })
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
    governanceShare: z.coerce.number().min(0).max(100),
    deployerShare: z.coerce.number().min(0).max(100),
    fixedPlatformFee: z.coerce.number().min(0).max(100),
    additionalRevenueRecipients: z
      .array(
        z.object({
          address: z.string().refine(isAddress, { message: 'Invalid Address' }),
          share: z.coerce.number().min(0).max(100),
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

      return {
        message: `The sum of the tokens distribution must be 100% (${
          difference.isPositive()
            ? `${difference.toString()}% missing`
            : `${difference.abs().toString()}% excess`
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

      return {
        message: `The sum of governance share, creator share, additional recipients shares and platform share must be 100% (${
          difference.isPositive()
            ? `${difference.toString()}% missing`
            : `${difference.abs().toString()}% excess`
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

export const dtfDeployDefaultValues = {
  tokenName: '',
  symbol: '',
  mandate: '',
  initialValue: 1,
  tokensDistribution: [],
  governanceERC20address: undefined,
  governanceVoteLock: undefined,
  governanceWalletAddress: undefined,
  folioFee: 2,
  mintFee: 0.5,
  governanceShare: 0,
  deployerShare: 0,
  fixedPlatformFee: 50,
  additionalRevenueRecipients: [],
  auctionLength: 30,
  auctionDelay: 24,
  guardians: [],
  brandManagers: [],
  auctionLaunchers: [],
  basketVotingDelay: 2880,
  basketVotingPeriod: 2880,
  basketVotingThreshold: 0.01,
  basketVotingQuorum: 10,
  basketExecutionDelay: 2880,
  governanceVotingDelay: 2880,
  governanceVotingPeriod: 2880,
  governanceVotingThreshold: 0.01,
  governanceVotingQuorum: 10,
  governanceExecutionDelay: 2880,
}

export type DeployInputs = z.infer<typeof DeployFormSchema>
