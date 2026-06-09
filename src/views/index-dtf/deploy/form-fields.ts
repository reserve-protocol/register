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
    fields: ['auctionLength', 'weightControl', 'bidsEnabled'],
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
  auctionLengthMax: msg`Auction length must not exceed 45 minutes`,
  invalidERC20: msg`Invalid ERC20 address`,
  voteLockNotAllowed: msg`Vote Lock address is not allowed for new DAO`,
  stRSRNotSupported: msg`stRSR DAO contracts for Index DTFs are not supported`,
  unsupportedVoteLock: msg`Unsupported Vote Lock Address`,
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
        msg`The sum of governance share, creator share, additional recipients shares and platform share must be 100% (${displayDifference}% missing)`
      )
    : t(
        msg`The sum of governance share, creator share, additional recipients shares and platform share must be 100% (${displayDifference}% excess)`
      )
}

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
      additionalRevenueRecipients: z
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
        .optional(),
      auctionLength: z.coerce
        .number<number>()
        .min(0)
        .max(45, t(messages.auctionLengthMax)),
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
      basketVotingDelay: z.coerce.number<number>().min(0),
      basketVotingPeriod: z.coerce.number<number>().min(0),
      basketVotingQuorum: z.coerce.number<number>().min(0).max(100),
      basketVotingThreshold: z.coerce.number<number>().min(0).max(100),
      basketExecutionDelay: z.coerce.number<number>().min(0),
      governanceVotingDelay: z.coerce.number<number>().min(0),
      governanceVotingPeriod: z.coerce.number<number>().min(0),
      governanceVotingQuorum: z.coerce.number<number>().min(0).max(100),
      governanceVotingThreshold: z.coerce.number<number>().min(0).max(100),
      governanceExecutionDelay: z.coerce.number<number>().min(0),
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
  additionalRevenueRecipients: [],
  auctionLength: 30,
  weightControl: false,
  bidsEnabled: true,
  guardians: [],
  brandManagers: [],
  auctionLaunchers: [],
  // TODO: This is different unit than owner governance settings
  basketVotingDelay: 48,
  basketVotingPeriod: 72,
  basketVotingThreshold: 0.01,
  basketVotingQuorum: 10,
  basketExecutionDelay: 48,
  // TODO: This is in days, we should use an standard unit of time
  governanceVotingDelay: 2,
  governanceVotingPeriod: 3,
  governanceVotingThreshold: 0.01,
  governanceVotingQuorum: 10,
  governanceExecutionDelay: 2,
}
