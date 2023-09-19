import {
  BackupBasket,
  Basket,
  RevenueSplit,
} from 'components/rtoken-setup/atoms'
import { StringMap } from 'types'
import { Address, parseEther, stringToHex, zeroAddress } from 'viem'
import { parsePercent } from './../../utils/index'

export const governanceDefaultValues = {
  defaultGovernance: true,
  unpause: '0',
  votingDelay: '14400', // 2 days
  votingPeriod: '21600', // 3 days
  proposalThresholdAsMicroPercent: '0.01', // 0.01%
  quorumPercent: '10', // 10%
  minDelay: '72', // 72 hours -> 86400
  guardian: '',
  pauser: '',
  owner: '',
}

export const defaultValues = {
  // token params
  name: '',
  symbol: '',
  manifesto: '',
  ownerAddress: '',
  // backing params
  tradingDelay: '7200',
  batchAuctionLength: '900',
  dutchAuctionLength: '1800',
  backingBuffer: '0.1', // 0.1%
  maxTradeSlippage: '0.5', // 0.5%
  issuanceThrottleAmount: '250000', // Anticipated redemption minimum amount for throttling
  issuanceThrottleRate: '5', // 2.5% per hour
  redemptionThrottleAmount: '500000',
  redemptionThrottleRate: '7.5',
  // other
  rewardRatio: '0.0000064180294',
  unstakingDelay: '1209600',
  minTrade: '1000',
  maxTrade: '1000000',
  shortFreeze: '259200', // 3 days
  longFreeze: '604800', // 1 week
  withdrawalLeak: '5', // 5%
  warmupPeriod: '900', // 15minutes
  // governance
  ...governanceDefaultValues,
}

export interface RevenueDist {
  rTokenDist: number
  rsrDist: number
}

export interface IssuanceThrottle {
  amtRate: bigint
  pctRate: bigint
}

export interface RTokenConfiguration {
  name: string
  symbol: string
  mandate: string
  params: {
    minTradeVolume: bigint
    rTokenMaxTradeVolume: bigint
    dist: RevenueDist
    rewardRatio: bigint
    unstakingDelay: number
    withdrawalLeak: bigint
    warmupPeriod: number
    tradingDelay: number
    batchAuctionLength: number
    dutchAuctionLength: number
    backingBuffer: bigint
    maxTradeSlippage: bigint
    shortFreeze: number
    longFreeze: number
    issuanceThrottle: IssuanceThrottle
    redemptionThrottle: IssuanceThrottle
  }
}

export interface BackupBasketConfiguration {
  backupUnit: `0x${string}`
  diversityFactor: bigint
  backupCollateral: Address[]
}

export interface ExternalDistribution {
  beneficiary: Address
  revShare: RevenueDist
}

export interface BasketConfiguration {
  assets: Address[]
  primaryBasket: Address[]
  weights: bigint[]
  backups: BackupBasketConfiguration[]
  beneficiaries: ExternalDistribution[]
}

/**
 * Convert revenue distribution (%) to number of shares
 * The number of shares cannot have decimal numbers
 * To avoid decimals, TOTAL_SHARES = 10000000
 */
export const getSharesFromSplit = (
  split: RevenueSplit
): [RevenueDist, ExternalDistribution[]] => {
  const SHARE_MULTIPLIER = 100 // being 0.1 of 0.1 the min number for share distribution

  return [
    {
      rTokenDist: Math.floor(+split.holders * SHARE_MULTIPLIER),
      rsrDist: Math.floor(+split.stakers * SHARE_MULTIPLIER),
    },
    split.external.map((externalSplit) => {
      const totalShares = +externalSplit.total * SHARE_MULTIPLIER

      return {
        beneficiary: externalSplit.address as Address,
        revShare: {
          rTokenDist: Math.floor((totalShares * +externalSplit.holders) / 100),
          rsrDist: Math.floor((totalShares * +externalSplit.stakers) / 100),
        },
      }
    }),
  ]
}

export const getDeployParameters = (
  tokenConfig: StringMap,
  basket: Basket,
  backup: BackupBasket,
  revenueSplit: RevenueSplit
): [RTokenConfiguration, BasketConfiguration] | undefined => {
  try {
    const [dist, beneficiaries] = getSharesFromSplit(revenueSplit)

    // RToken configuration parameters
    const config: RTokenConfiguration = {
      name: tokenConfig.name,
      symbol: tokenConfig.ticker,
      mandate: tokenConfig.mandate,
      params: {
        withdrawalLeak: parsePercent(tokenConfig.withdrawalLeak),
        warmupPeriod: Number(tokenConfig.warmupPeriod),
        dutchAuctionLength: Number(tokenConfig.dutchAuctionLength),
        minTradeVolume: parseEther(tokenConfig.minTrade.toString()),
        rTokenMaxTradeVolume: parseEther(tokenConfig.maxTrade.toString()),
        dist,
        rewardRatio: parseEther(tokenConfig.rewardRatio),
        unstakingDelay: Number(tokenConfig.unstakingDelay),
        tradingDelay: Number(tokenConfig.tradingDelay),
        batchAuctionLength: Number(tokenConfig.batchAuctionLength),
        backingBuffer: parsePercent(tokenConfig.backingBuffer),
        maxTradeSlippage: parsePercent(tokenConfig.maxTradeSlippage),
        shortFreeze: Number(tokenConfig.shortFreeze),
        longFreeze: Number(tokenConfig.longFreeze),
        issuanceThrottle: {
          amtRate: parseEther(tokenConfig.issuanceThrottleAmount),
          pctRate: parsePercent(tokenConfig.issuanceThrottleRate),
        },
        redemptionThrottle: {
          amtRate: parseEther(tokenConfig.redemptionThrottleAmount),
          pctRate: parsePercent(tokenConfig.redemptionThrottleRate),
        },
      },
    }

    // Basket configuration
    const assets: Set<Address> = new Set()
    const primaryBasket: Address[] = []
    const weights: bigint[] = []
    const backups: BackupBasketConfiguration[] = []

    for (const targetUnit of Object.keys(basket)) {
      const { collaterals, distribution, scale } = basket[targetUnit]

      collaterals.forEach((collateral, index) => {
        primaryBasket.push(collateral.address as Address)
        if (
          !!collateral.rewardToken?.length &&
          collateral.rewardToken[0] !== zeroAddress
        ) {
          collateral.rewardToken.forEach((reward) =>
            assets.add(reward as Address)
          )
        }

        weights.push(
          parseEther(
            ((Number(distribution[index]) / 100) * Number(scale)).toFixed(18)
          )
        )
      })

      if (backup[targetUnit] && backup[targetUnit].collaterals.length) {
        backups.push({
          backupUnit: stringToHex(targetUnit.toUpperCase(), { size: 32 }),
          diversityFactor: BigInt(backup[targetUnit].diversityFactor),
          backupCollateral: backup[targetUnit].collaterals.map((c) => {
            if (!!c.rewardToken?.length && c.rewardToken[0] !== zeroAddress) {
              c.rewardToken.forEach((reward) => assets.add(reward as Address))
            }
            return c.address as Address
          }),
        })
      }
    }

    const basketConfig: BasketConfiguration = {
      assets: Array.from(assets),
      primaryBasket,
      weights,
      backups,
      beneficiaries,
    }

    return [config, basketConfig]
  } catch (e) {
    // TODO: Handle error case here
    console.error('Error deploying rToken', e)

    return undefined
  }
}

export function safeJsonFormat(data: unknown) {
  return JSON.stringify(
    data,
    (key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
  )
}
