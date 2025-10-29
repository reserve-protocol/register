import {
  BackupBasket,
  Basket,
  RevenueSplit,
} from 'components/rtoken-setup/atoms'
import { StringMap } from 'types'
import { Address, parseEther, stringToHex, zeroAddress } from 'viem'
import { parsePercent } from '@/utils'
import {
  VERSION_REGISTRY_ADDRESS,
  ASSET_PLUGIN_REGISTRY_ADDRESS,
  DAO_FEE_REGISTRY_ADDRESS,
  TRUSTED_FILLER_REGISTRY_ADDRESS,
} from 'utils/addresses'

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
    reweightable: boolean
    enableIssuancePremium: boolean
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

export interface Registries {
  versionRegistry: Address
  assetPluginRegistry: Address
  daoFeeRegistry: Address
  trustedFillerRegistry: Address
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

  const dist = {
    rTokenDist: Math.floor(+split.holders * SHARE_MULTIPLIER),
    rsrDist: Math.floor(+split.stakers * SHARE_MULTIPLIER),
  }

  const externals = split.external.map((externalSplit) => {
    const totalShares = +externalSplit.total * SHARE_MULTIPLIER

    return {
      beneficiary: externalSplit.address as Address,
      revShare: {
        rTokenDist: Math.floor((totalShares * +externalSplit.holders) / 100),
        rsrDist: Math.floor((totalShares * +externalSplit.stakers) / 100),
      },
    }
  })

  // Calculate total shares to ensure they sum to exactly 10000
  const totalShares =
    dist.rTokenDist +
    dist.rsrDist +
    externals.reduce(
      (sum, ext) => sum + ext.revShare.rTokenDist + ext.revShare.rsrDist,
      0
    )

  // If total is not exactly 10000, adjust the largest share
  if (totalShares !== 10000) {
    const diff = 10000 - totalShares

    // Find the largest share and add the difference
    let maxValue = 0
    let maxType: 'rToken' | 'rsr' | 'external' = 'rToken'
    let maxIndex = 0

    if (dist.rTokenDist > maxValue) {
      maxValue = dist.rTokenDist
      maxType = 'rToken'
    }
    if (dist.rsrDist > maxValue) {
      maxValue = dist.rsrDist
      maxType = 'rsr'
    }

    externals.forEach((ext, index) => {
      if (ext.revShare.rTokenDist > maxValue) {
        maxValue = ext.revShare.rTokenDist
        maxType = 'external'
        maxIndex = index
      }
      if (ext.revShare.rsrDist > maxValue) {
        maxValue = ext.revShare.rsrDist
        maxType = 'external'
        maxIndex = index
      }
    })

    // Apply the adjustment to the largest share
    if (maxType === 'rToken') {
      dist.rTokenDist += diff
    } else if (maxType === 'rsr') {
      dist.rsrDist += diff
    } else if (maxType === 'external' && externals[maxIndex]) {
      // Determine which part of the external share is larger
      if (externals[maxIndex].revShare.rTokenDist >= externals[maxIndex].revShare.rsrDist) {
        externals[maxIndex].revShare.rTokenDist += diff
      } else {
        externals[maxIndex].revShare.rsrDist += diff
      }
    }
  }

  return [dist, externals]
}

export const getDeployParameters = (
  tokenConfig: StringMap,
  basket: Basket,
  backup: BackupBasket,
  revenueSplit: RevenueSplit,
  chainId: number
): [RTokenConfiguration, BasketConfiguration, Registries] | undefined => {
  try {
    const [dist, beneficiaries] = getSharesFromSplit(revenueSplit)

    // RToken configuration parameters
    const config: RTokenConfiguration = {
      name: tokenConfig.name,
      symbol: tokenConfig.ticker,
      mandate: tokenConfig.mandate,
      params: {
        reweightable: tokenConfig.reweightable,
        enableIssuancePremium: tokenConfig.enableIssuancePremium,
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
          !!collateral.rewardTokens?.length &&
          collateral.rewardTokens[0] !== zeroAddress
        ) {
          collateral.rewardTokens.forEach((reward) =>
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
            if (!!c.rewardTokens?.length && c.rewardTokens[0] !== zeroAddress) {
              c.rewardTokens.forEach((reward) => assets.add(reward as Address))
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

    const registries: Registries = {
      versionRegistry: VERSION_REGISTRY_ADDRESS[chainId] as Address,
      assetPluginRegistry: ASSET_PLUGIN_REGISTRY_ADDRESS[chainId] as Address,
      daoFeeRegistry: DAO_FEE_REGISTRY_ADDRESS[chainId] as Address,
      trustedFillerRegistry: TRUSTED_FILLER_REGISTRY_ADDRESS[
        chainId
      ] as Address,
    }

    return [config, basketConfig, registries]
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
