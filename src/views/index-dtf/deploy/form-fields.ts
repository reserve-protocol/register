import { isAddress } from 'viem'
import { z } from 'zod'
import { isERC20, isVoteLockAddress } from './utils'

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
    fields: ['name', 'symbol', 'mandate'],
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
      'customFolioFee',
      'mintFee',
      'customMintFee',
      'governanceShare',
      'deployerShare',
      'fixedPlatformFee',
      'additionalRevenueRecipients',
    ],
  },
  auctions: {
    fields: [
      'auctionLength',
      'auctionDelay',
      'auctionLauncher',
      'customAuctionLength',
      'customAuctionDelay',
      'additionalAuctionLaunchers',
    ],
  },
  roles: {
    fields: ['guardianAddress', 'brandManagerAddress'],
  },
  'basket-changes': {
    fields: [
      'basketVotingDelay',
      'customBasketVotingDelay',
      'basketVotingPeriod',
      'customBasketVotingPeriod',
      'basketVotingQuorum',
      'customBasketVotingQuorum',
      'basketExecutionDelay',
      'customBasketExecutionDelay',
    ],
  },
  'other-changes': {
    fields: [
      'governanceVotingDelay',
      'customGovernanceVotingDelay',
      'governanceVotingPeriod',
      'customGovernanceVotingPeriod',
      'governanceVotingQuorum',
      'customGovernanceVotingQuorum',
      'governanceExecutionDelay',
      'customGovernanceExecutionDelay',
    ],
  },
}

export const DeployFormSchema = z
  .object({
    name: z.string().min(1, 'Token name is required'),
    symbol: z
      .string()
      .min(1, 'Token symbol is required')
      .refine((value) => !value.includes(' '), {
        message: 'Token symbol cannot contain spaces',
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
      .min(0, 'Folio fee must be 0 or greater')
      .max(10, 'Folio fee must be 10% or less')
      .optional(),
    customFolioFee: z.coerce
      .number()
      .min(0, 'Folio fee must be 0 or greater')
      .max(5, 'Folio fee must be 5% or less')
      .optional(),
    mintFee: z.coerce
      .number()
      .min(0.05, 'Mint fee must be 0.05% or greater')
      .max(5, 'Mint fee must be 5% or less')
      .optional(),
    customMintFee: z.coerce
      .number()
      .min(0.05, 'Mint fee must be 0.05% or greater')
      .max(10, 'Mint fee must be 10% or less')
      .optional(),
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
    auctionLength: z.coerce.number().min(0).optional(),
    auctionDelay: z.coerce.number().min(0).optional(),
    auctionLauncher: z
      .string()
      .refine(isAddress, { message: 'Invalid Address' })
      .optional(),
    customAuctionLength: z.coerce.number().min(1).max(10080).optional(),
    customAuctionDelay: z.coerce.number().min(0).max(10080).optional(),
    additionalAuctionLaunchers: z.array(
      z.string().refine(isAddress, { message: 'Invalid Address' })
    ),
    guardianAddress: z
      .string()
      .refine(isAddress, { message: 'Invalid Address' })
      .optional(),
    brandManagerAddress: z
      .string()
      .refine(isAddress, { message: 'Invalid Address' })
      .optional(),
    basketVotingDelay: z.coerce.number().min(0).optional(),
    customBasketVotingDelay: z.coerce.number().min(0).optional(),
    basketVotingPeriod: z.coerce.number().min(0).optional(),
    customBasketVotingPeriod: z.coerce.number().min(0).optional(),
    basketVotingQuorum: z.coerce.number().min(0).optional(),
    customBasketVotingQuorum: z.coerce.number().min(0).max(100).optional(),
    basketVotingThreshold: z.coerce.number().min(0).optional(),
    customBasketVotingThreshold: z.coerce.number().min(0).max(100).optional(),
    basketExecutionDelay: z.coerce.number().min(0).optional(),
    customBasketExecutionDelay: z.coerce.number().min(0).optional(),
    governanceVotingDelay: z.coerce.number().min(0).optional(),
    customGovernanceVotingDelay: z.coerce.number().min(0).optional(),
    governanceVotingPeriod: z.coerce.number().min(0).optional(),
    customGovernanceVotingPeriod: z.coerce.number().min(0).optional(),
    governanceVotingQuorum: z.coerce.number().min(0).optional(),
    customGovernanceVotingQuorum: z.coerce.number().min(0).optional(),
    governanceVotingThreshold: z.coerce.number().min(0).optional(),
    customGovernanceVotingThreshold: z.coerce
      .number()
      .min(0)
      .max(100)
      .optional(),
    governanceExecutionDelay: z.coerce.number().min(0).optional(),
    customGovernanceExecutionDelay: z.coerce.number().min(0).optional(),
  })
  .refine(
    (data) => {
      const total = data.tokensDistribution?.reduce(
        (sum, { percentage }) => sum + percentage,
        0
      )
      return total === 100
    },
    (data) => {
      const total =
        data.tokensDistribution?.reduce(
          (sum, { percentage }) => sum + percentage,
          0
        ) || 0
      const difference = 100 - total

      return {
        message: `The sum of the tokens distribution must be 100% (${
          difference > 0
            ? `${difference}% missing`
            : `${Math.abs(difference)}% excess`
        }).`,
        path: ['basket'],
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
    (data) => {
      // Check if the folio fee is set
      return data.folioFee !== undefined || data.customFolioFee
    },
    {
      message: 'Folio fee is required',
      path: ['folioFee'],
    }
  )
  .refine(
    (data) => {
      // Check if the folio fee is set
      return data.mintFee !== undefined || data.mintFee
    },
    {
      message: 'Mint fee is required',
      path: ['mintFee'],
    }
  )
  .refine(
    (data) => {
      // Check if the sum of the shares is 100, including additional revenue recipients
      const additionalShares =
        data.additionalRevenueRecipients?.reduce(
          (acc, { share }) => acc + share,
          0
        ) || 0

      const totalShares =
        data.governanceShare +
        data.deployerShare +
        data.fixedPlatformFee +
        additionalShares

      return totalShares === 100
    },
    {
      message: 'The sum of the shares must be 100',
      path: ['revenue-distribution'],
    }
  )
  .refine((data) => data.auctionLauncher, {
    message: 'Auction launcher address is required',
    path: ['auctionLauncher'],
  })
  .refine(
    (data) => {
      // Check if the auction settings are valid
      const auctionLengthSet =
        data.auctionLength !== undefined || data.customAuctionLength
      const auctionDelaySet =
        data.auctionDelay !== undefined || data.customAuctionDelay
      return auctionLengthSet && auctionDelaySet
    },
    {
      message: 'Auction settings are invalid',
      path: ['auctions'],
    }
  )
  .refine((data) => data.guardianAddress, {
    message: 'Guardian address is required',
    path: ['guardianAddress'],
  })
  .refine((data) => data.brandManagerAddress, {
    message: 'Brand manager address is required',
    path: ['brandManagerAddress'],
  })
  .refine(
    (data) => {
      // Check if the basket changes settings are valid
      const basketVotingDelaySet =
        data.basketVotingDelay || data.customBasketVotingDelay
      const basketVotingPeriodSet =
        data.basketVotingPeriod || data.customBasketVotingPeriod
      const basketVotingQuorumSet =
        data.basketVotingQuorum || data.customBasketVotingQuorum
      const basketVotingThresholdSet =
        data.basketVotingThreshold || data.customBasketVotingThreshold
      const basketExecutionDelaySet =
        data.basketExecutionDelay || data.customBasketExecutionDelay

      return (
        basketVotingDelaySet &&
        basketVotingPeriodSet &&
        basketVotingQuorumSet &&
        basketVotingThresholdSet &&
        basketExecutionDelaySet
      )
    },
    {
      message: 'Basket changes settings are invalid',
      path: ['basket-changes'],
    }
  )
  .refine(
    (data) => {
      // Check if the governance settings are valid
      const governanceVotingDelaySet =
        data.governanceVotingDelay || data.customGovernanceVotingDelay
      const governanceVotingPeriodSet =
        data.governanceVotingPeriod || data.customGovernanceVotingPeriod
      const governanceVotingQuorumSet =
        data.governanceVotingQuorum || data.customGovernanceVotingQuorum
      const governanceVotingThresholdSet =
        data.governanceVotingThreshold || data.customGovernanceVotingThreshold
      const governanceExecutionDelaySet =
        data.governanceExecutionDelay || data.customGovernanceExecutionDelay

      return (
        governanceVotingDelaySet &&
        governanceVotingPeriodSet &&
        governanceVotingQuorumSet &&
        governanceVotingThresholdSet &&
        governanceExecutionDelaySet
      )
    },
    {
      message: 'Other changes settings are invalid',
      path: ['other-changes'],
    }
  )

export const dtfDeployDefaultValues = {
  name: '',
  symbol: '',
  mandate: '',
  initialValue: 1,
  tokensDistribution: [],
  governanceERC20address: undefined,
  governanceVoteLock: undefined,
  governanceWalletAddress: undefined,
  folioFee: 0,
  customFolioFee: undefined,
  mintFee: 0.05,
  customMintFee: undefined,
  governanceShare: 0,
  deployerShare: 0,
  fixedPlatformFee: 20,
  additionalRevenueRecipients: [],
  auctionLength: 15,
  auctionDelay: 15,
  auctionLauncher: undefined,
  customAuctionLength: undefined,
  customAuctionDelay: undefined,
  additionalAuctionLaunchers: [],
  guardianAddress: undefined,
  brandManagerAddress: undefined,
  basketVotingDelay: 20,
  customBasketVotingDelay: undefined,
  basketVotingPeriod: 20,
  customBasketVotingPeriod: undefined,
  basketVotingThreshold: 0.01,
  customBasketVotingThreshold: undefined,
  basketVotingQuorum: 20,
  customBasketVotingQuorum: undefined,
  basketExecutionDelay: 20,
  customBasketExecutionDelay: undefined,
  governanceVotingDelay: 20,
  customGovernanceVotingDelay: undefined,
  governanceVotingPeriod: 20,
  customGovernanceVotingPeriod: undefined,
  governanceVotingThreshold: 0.01,
  customGovernanceVotingThreshold: undefined,
  governanceVotingQuorum: 20,
  customGovernanceVotingQuorum: undefined,
  governanceExecutionDelay: 20,
  customGovernanceExecutionDelay: undefined,
}

export type DeployInputs = z.infer<typeof DeployFormSchema>
