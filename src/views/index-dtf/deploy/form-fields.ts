import { isAddress } from 'viem'
import { z } from 'zod'

export type DeployStepId =
  | 'metadata'
  | 'basket'
  | 'governance'
  | 'revenue-distribution'
  | 'auctions'
  | 'roles'
  | 'voting'

export const dtfDeploySteps: Record<DeployStepId, { fields: string[] }> = {
  metadata: {
    fields: ['name', 'symbol', 'mandate'],
  },
  basket: {
    fields: ['initialValue', 'tokensDistribution'],
  },
  governance: {
    fields: [
      'governanceERC20name',
      'governanceERC20symbol',
      'governanceERC20address',
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
  voting: {
    fields: [
      'basketVotingDelay',
      'customBasketVotingDelay',
      'basketVotingPeriod',
      'customBasketVotingPeriod',
      'basketVotingQuorum',
      'customBasketVotingQuorum',
      'basketExecutionDelay',
      'customBasketExecutionDelay',
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
    symbol: z.string().min(1, 'Token symbol is required'),
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
    governanceERC20name: z.string().min(1, 'Token name is required').optional(),
    governanceERC20symbol: z
      .string()
      .min(1, 'Token symbol is required')
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
      .min(0, 'Folio fee must be 0 or greater')
      .max(20, 'Folio fee must be 20% or less')
      .optional(),
    customFolioFee: z.coerce
      .number()
      .min(0, 'Folio fee must be 0 or greater')
      .max(20, 'Folio fee must be 20% or less')
      .optional(),
    mintFee: z.coerce
      .number()
      .min(0.05, 'Mint fee must be 0.05% or greater')
      .max(5, 'Mint fee must be 5% or less')
      .optional(),
    customMintFee: z.coerce
      .number()
      .min(0.05, 'Mint fee must be 0.05% or greater')
      .max(5, 'Mint fee must be 5% or less')
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
      // Check if the sum of the tokens distribution is 100
      const totalDist = data.tokensDistribution.reduce(
        (acc, { percentage }) => acc + percentage,
        0
      )
      return totalDist === 100
    },
    {
      message: 'The sum of the tokens distribution must be 100',
      path: ['basket'],
    }
  )
  .refine(
    (data) => {
      // Check if the governance settings are valid
      const governanceNewERC20 =
        data.governanceERC20name && data.governanceERC20symbol
      const governanceExistingERC20 = data.governanceERC20address
      const governanceWallet = data.governanceWalletAddress

      return (
        (governanceNewERC20 && !governanceExistingERC20 && !governanceWallet) ||
        (!governanceNewERC20 && governanceExistingERC20 && !governanceWallet) ||
        (!governanceNewERC20 && !governanceExistingERC20 && governanceWallet)
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
      // Check if the voting settings are valid
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
        basketVotingDelaySet &&
        basketVotingPeriodSet &&
        basketVotingQuorumSet &&
        basketVotingThresholdSet &&
        basketExecutionDelaySet &&
        governanceVotingDelaySet &&
        governanceVotingPeriodSet &&
        governanceVotingQuorumSet &&
        governanceVotingThresholdSet &&
        governanceExecutionDelaySet
      )
    },
    {
      message: 'Voting settings are invalid',
      path: ['voting'],
    }
  )

export const dtfDeployDefaultValues = {
  name: '',
  symbol: '',
  initialValue: 1,
  tokensDistribution: [],
  governanceERC20name: undefined,
  governanceERC20symbol: undefined,
  governanceERC20address: undefined,
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
  basketVotingQuorum: 20,
  customBasketVotingQuorum: undefined,
  basketExecutionDelay: 20,
  customBasketExecutionDelay: undefined,
  governanceVotingDelay: 20,
  customGovernanceVotingDelay: undefined,
  governanceVotingPeriod: 20,
  customGovernanceVotingPeriod: undefined,
  governanceVotingQuorum: 20,
  customGovernanceVotingQuorum: undefined,
  governanceExecutionDelay: 20,
  customGovernanceExecutionDelay: undefined,
}

export type DeployInputs = z.infer<typeof DeployFormSchema>
