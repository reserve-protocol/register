import { z } from 'zod'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import type { MessageDescriptor } from '@lingui/core'
import { useMemo } from 'react'
import {
  isAddressNotStrict,
  isERC20,
  isNotStRSR,
  isNotVoteLockAddress,
  isOptimisticVault,
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
  | 'governance-settings'

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
      'holderShare',
      'additionalRevenueRecipients',
      'permanentRevenueRecipients',
    ],
  },
  auctions: {
    fields: ['maxAuctionLength', 'weightControl', 'bidsEnabled'],
  },
  roles: {
    fields: ['guardians', 'brandManagers', 'auctionLaunchers'],
  },
  'governance-settings': {
    fields: [
      'governanceVotingDelay',
      'governanceVotingPeriod',
      'governanceVoteExtension',
      'governanceVotingThreshold',
      'governanceVotingQuorum',
      'governanceExecutionDelay',
      'optimisticVetoDelay',
      'optimisticVetoPeriod',
      'optimisticVetoThreshold',
      'proposalThrottleCapacity',
      'optimisticActions',
      'optimisticProposers',
      'vaultUnstakingDelay',
      'vaultRewardHalfLife',
    ],
  },
}

const messages = {
  tokenNameRequired: msg`Token name is required`,
  tokenNameMax: msg`Token name must be 80 characters or less`,
  tokenNameAlphanumeric: msg`Token name must contain letters or numbers`,
  tokenNameSpecial: msg`Token name cannot contain special characters or emojis`,
  symbolRequired: msg`Token symbol is required`,
  symbolMax: msg`Token symbol must be 12 characters or less`,
  symbolSpaces: msg`Token symbol cannot contain spaces`,
  symbolSpecial: msg`Token symbol cannot contain special characters or emojis`,
  chain: msg`Chain must be either Mainnet, Base or Binance Smart Chain`,
  initialValuePositive: msg`Initial value must be positive`,
  invalidAddress: msg`Invalid Address`,
  tokenDistributionPositive: msg`Token distribution must be positive`,
  folioFeeMin: msg`Annualized TVL Fee must be 0.15% or greater`,
  folioFeeMax: msg`Annualized TVL Fee must be 10% or less`,
  mintFeeMin: msg`Mint Fee must be 0.15% or greater`,
  mintFeeMax: msg`Mint Fee must be 5% or less`,
  maxPrecision: msg`Max precision is 0.01%`,
  maxAuctionLengthMin: msg`Max auction length must be at least 2 minutes`,
  maxAuctionLengthMax: msg`Max auction length must not exceed 1 week (10080 minutes)`,
  vetoPeriodMin: msg`Veto period must be at least 5 minutes`,
  vetoDelayMin: msg`Veto delay must be at least 1 second`,
  positivePercentage: msg`Must be above 0% and at most 100%`,
  throttleRange: msg`Proposals per 12 hours must be between 1 and 12`,
  rewardHalfLifeRange: msg`Reward half-life must be between 1 and 14 days`,
  unstakingDelayMax: msg`Unstaking delay must not exceed 28 days`,
  duplicatedOptimisticProposers: msg`Duplicated optimistic proposers`,
  invalidERC20: msg`Invalid ERC20 address`,
  voteLockNotAllowed: msg`Vote Lock address is not allowed for new DAO`,
  stRSRNotSupported: msg`stRSR DAO contracts for Index DTFs are not supported`,
  unsupportedVoteLock: msg`Unsupported Vote Lock Address`,
  legacyVoteLock: msg`This vote-lock can't govern a 6.0 DTF. Use a vault created with the current governance deployer, like vlRSR, or create a new one.`,
  allTokenUnitsPositive: msg`All token units must be valid positive numbers`,
  invalidGovernanceSettings: msg`Invalid governance settings`,
  duplicatedGuardians: msg`Duplicated guardians`,
  duplicatedBrandManagers: msg`Duplicated brand managers`,
  duplicatedAuctionLaunchers: msg`Duplicated auction launchers`,
  duplicatedAdditionalRecipients: msg`Duplicated additional recipients`,
}

type Translate = (descriptor: MessageDescriptor) => string

const basketTotalMessage = (t: Translate, difference: Decimal) => {
  const displayDifference = difference.abs().toDisplayString()
  return difference.isPositive()
    ? t(
        msg`The sum of the tokens distribution must be 100% (${displayDifference}% missing).`
      )
    : t(
        msg`The sum of the tokens distribution must be 100% (${displayDifference}% excess).`
      )
}

const revenueTotalMessage = (t: Translate, difference: Decimal) => {
  const displayDifference = difference.abs().toDisplayString()
  return difference.isPositive()
    ? t(
        msg`The sum of holder share, governance share, creator share, additional and permanent recipients shares and platform share must be 100% (${displayDifference}% missing)`
      )
    : t(
        msg`The sum of holder share, governance share, creator share, additional and permanent recipients shares and platform share must be 100% (${displayDifference}% excess)`
      )
}

const recipientsSchema = (t: Translate) =>
  z
    .array(
      z.object({
        address: z.string().refine(isAddressNotStrict, {
          message: t(messages.invalidAddress),
        }),
        share: z.coerce
          .number<number>()
          .multipleOf(0.01, t(messages.maxPrecision))
          .min(0)
          .max(100),
      })
    )
    .optional()

const positivePercentage = (t: Translate) =>
  z.coerce
    .number<number>()
    .gt(0, t(messages.positivePercentage))
    .max(100, t(messages.positivePercentage))

export const buildDeployFormSchema = (t: Translate) =>
  z
    .object({
      inputType: z.string(),
      tokenName: z
        .string()
        .min(1, t(messages.tokenNameRequired))
        .max(80, t(messages.tokenNameMax))
        .refine((value) => /[a-zA-Z0-9]/.test(value), {
          message: t(messages.tokenNameAlphanumeric),
        })
        .refine(noSpecialCharacters, {
          message: t(messages.tokenNameSpecial),
        }),
      symbol: z
        .string()
        .min(1, t(messages.symbolRequired))
        .max(12, t(messages.symbolMax))
        .refine((value) => !value.includes(' '), {
          message: t(messages.symbolSpaces),
        })
        .refine(noSpecialCharacters, {
          message: t(messages.symbolSpecial),
        }),
      mandate: z.string().optional(),
      chain: z
        .number()
        .refine(
          (value) =>
            value === ChainId.Mainnet ||
            value === ChainId.Base ||
            value === ChainId.BSC,
          {
            message: t(messages.chain),
          }
        ),
      initialValue: z.coerce
        .number<number>()
        .positive(t(messages.initialValuePositive)),
      tokensDistribution: z.array(
        z.object({
          address: z.string().refine(isAddressNotStrict, {
            message: t(messages.invalidAddress),
          }),
          percentage: z.coerce
            .number<number>()
            // .multipleOf(0.01, 'Max precision is 0.01%')
            .positive(t(messages.tokenDistributionPositive)),
        })
      ),
      governanceVoteLock: z
        .string()
        .refine(isAddressNotStrict, { message: t(messages.invalidAddress) })
        .optional(),
      governanceERC20address: z
        .string()
        .refine(isAddressNotStrict, { message: t(messages.invalidAddress) })
        .optional(),
      governanceWalletAddress: z
        .string()
        .refine(isAddressNotStrict, { message: t(messages.invalidAddress) })
        .optional(),
      folioFee: z.coerce
        .number<number>()
        .min(0.15, t(messages.folioFeeMin))
        .max(10, t(messages.folioFeeMax)),
      mintFee: z.coerce
        .number<number>()
        .min(0.15, t(messages.mintFeeMin))
        .max(5, t(messages.mintFeeMax)),
      governanceShare: z.coerce
        .number<number>()
        .multipleOf(0.01, t(messages.maxPrecision))
        .min(0)
        .max(100),
      deployerShare: z.coerce
        .number<number>()
        .multipleOf(0.01, t(messages.maxPrecision))
        .min(0)
        .max(100),
      fixedPlatformFee: z.coerce
        .number<number>()
        .multipleOf(0.01, t(messages.maxPrecision))
        .min(0)
        .max(100),
      holderShare: z.coerce
        .number<number>()
        .multipleOf(0.01, t(messages.maxPrecision))
        .min(0)
        .max(100),
      additionalRevenueRecipients: recipientsSchema(t),
      permanentRevenueRecipients: recipientsSchema(t),
      maxAuctionLength: z.coerce
        .number<number>()
        .min(2, t(messages.maxAuctionLengthMin))
        .max(10_080, t(messages.maxAuctionLengthMax)),
      weightControl: z.boolean(),
      bidsEnabled: z.boolean(),
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
      governanceVotingDelay: z.coerce.number<number>().min(0),
      governanceVotingPeriod: z.coerce.number<number>().min(0),
      governanceVoteExtension: z.coerce.number<number>().min(0),
      governanceVotingQuorum: positivePercentage(t),
      governanceVotingThreshold: positivePercentage(t),
      governanceExecutionDelay: z.coerce.number<number>().min(0),
      // Veto window in hours; the governor needs a delay of at least 1s and a period of at least 5 minutes.
      optimisticVetoDelay: z.coerce
        .number<number>()
        .min(1 / 3600, t(messages.vetoDelayMin)),
      optimisticVetoPeriod: z.coerce
        .number<number>()
        .min(5 / 60, t(messages.vetoPeriodMin)),
      optimisticVetoThreshold: positivePercentage(t),
      proposalThrottleCapacity: z.coerce
        .number<number>()
        .int(t(messages.throttleRange))
        .min(1, t(messages.throttleRange))
        .max(12, t(messages.throttleRange)),
      optimisticActions: z.array(z.string()),
      optimisticProposers: z.array(
        z
          .string()
          .refine((value) => !value || isAddressNotStrict(value), {
            message: t(messages.invalidAddress),
          })
          .optional()
      ),
      // A new vault's own settings, in days.
      vaultUnstakingDelay: z.coerce
        .number<number>()
        .min(0)
        .max(28, t(messages.unstakingDelayMax)),
      vaultRewardHalfLife: z.coerce
        .number<number>()
        .min(1, t(messages.rewardHalfLifeRange))
        .max(14, t(messages.rewardHalfLifeRange)),
    })
    .refine(
      (data) =>
        !data.governanceERC20address ||
        isERC20(data.governanceERC20address, data.chain),
      {
        message: t(messages.invalidERC20),
        path: ['governanceERC20address'],
      }
    )
    .refine(
      (data) =>
        !data.governanceERC20address ||
        isNotVoteLockAddress(data.governanceERC20address, data.chain),
      {
        message: t(messages.voteLockNotAllowed),
        path: ['governanceERC20address'],
      }
    )
    .refine(
      (data) =>
        !data.governanceVoteLock ||
        isNotStRSR(data.governanceVoteLock, data.chain),
      {
        message: t(messages.stRSRNotSupported),
        path: ['governanceVoteLock'],
      }
    )
    .refine(
      (data) =>
        !data.governanceVoteLock ||
        isVoteLockAddress(data.governanceVoteLock, data.chain),
      {
        message: t(messages.unsupportedVoteLock),
        path: ['governanceVoteLock'],
      }
    )
    .refine(
      (data) =>
        !data.governanceVoteLock ||
        isOptimisticVault(data.governanceVoteLock as `0x${string}`, data.chain),
      {
        message: t(messages.legacyVoteLock),
        path: ['governanceVoteLock'],
      }
    )
    .superRefine((data, ctx) => {
      if (data.inputType === 'unit') {
        const allValid = data.tokensDistribution.every(
          (token) =>
            !isNaN(Number(token.percentage)) && Number(token.percentage) > 0
        )
        if (!allValid) {
          ctx.addIssue({
            code: 'custom',
            message: t(messages.allTokenUnitsPositive),
            path: ['basket'],
          })
        }
        return
      }

      const total =
        data.tokensDistribution?.reduce(
          (sum, { percentage }) => sum.plus(new Decimal(percentage)),
          new Decimal(0)
        ) || new Decimal(0)

      if (!total.eq(new Decimal(100))) {
        const difference = new Decimal(100).minus(total)

        ctx.addIssue({
          code: 'custom',
          message: basketTotalMessage(t, difference),
          path: ['basket'],
        })
      }
    })
    .superRefine((data, ctx) => {
      const totalShares = [
        data.holderShare,
        data.governanceShare,
        data.deployerShare,
        ...(data.additionalRevenueRecipients?.map((r) => r.share) || []),
        ...(data.permanentRevenueRecipients?.map((r) => r.share) || []),
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
        const options = [
          data.governanceERC20address,
          data.governanceVoteLock,
          data.governanceWalletAddress,
        ].filter(Boolean)
        return options.length === 1
      },
      { message: t(messages.invalidGovernanceSettings), path: ['governance'] }
    )
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
        ).size === data.optimisticProposers.length,
      {
        message: t(messages.duplicatedOptimisticProposers),
        path: ['governance-settings'],
      }
    )
    .refine(
      (data) => {
        const governanceAddresses = [
          ...(data.governanceERC20address
            ? [data.governanceERC20address.toLowerCase()]
            : []),
          ...(data.governanceVoteLock
            ? [data.governanceVoteLock.toLowerCase()]
            : []),
          ...(data.governanceWalletAddress
            ? [data.governanceWalletAddress.toLowerCase()]
            : []),
        ]
        return (
          new Set([
            ...[
              ...(data.additionalRevenueRecipients ?? []),
              ...(data.permanentRevenueRecipients ?? []),
            ].map((item) => item?.address?.toLowerCase() || item?.address),
            ...governanceAddresses,
          ]).size ===
          (data.additionalRevenueRecipients?.length || 0) +
            (data.permanentRevenueRecipients?.length || 0) +
            governanceAddresses.length
        )
      },
      {
        message: t(messages.duplicatedAdditionalRecipients),
        path: ['revenue-distribution'],
      }
    )

// Default English schema (used by tests and as a non-reactive fallback).
// UI code must use useDeployFormSchema() so messages follow the active locale.
const defaultTranslate: Translate = (descriptor) =>
  (typeof descriptor === 'string'
    ? descriptor
    : (descriptor.message ?? descriptor.id)) as string

export const DeployFormSchema = buildDeployFormSchema(defaultTranslate)

export const useDeployFormSchema = () => {
  const { t } = useLingui()
  return useMemo(() => buildDeployFormSchema(t), [t])
}

export type DeployInputs = z.output<typeof DeployFormSchema>

export const dtfDeployDefaultValues: DeployInputs = {
  tokenName: '',
  symbol: '',
  mandate: '',
  chain: 1,
  initialValue: 1,
  inputType: 'unit',
  tokensDistribution: [],
  governanceERC20address: undefined,
  governanceVoteLock: undefined,
  governanceWalletAddress: undefined,
  folioFee: 1,
  mintFee: 0.5,
  governanceShare: 0,
  deployerShare: 0,
  fixedPlatformFee: 50,
  holderShare: 0,
  additionalRevenueRecipients: [],
  permanentRevenueRecipients: [],
  maxAuctionLength: 30,
  weightControl: false,
  bidsEnabled: true,
  guardians: [],
  brandManagers: [],
  auctionLaunchers: [],
  governanceVotingDelay: 2,
  governanceVotingPeriod: 3,
  governanceVoteExtension: 2,
  governanceVotingThreshold: 0.01,
  governanceVotingQuorum: 10,
  governanceExecutionDelay: 2,
  optimisticVetoDelay: 4,
  optimisticVetoPeriod: 20,
  optimisticVetoThreshold: 1,
  proposalThrottleCapacity: 3,
  optimisticActions: [],
  optimisticProposers: [],
  vaultUnstakingDelay: 7,
  vaultRewardHalfLife: 7,
}
