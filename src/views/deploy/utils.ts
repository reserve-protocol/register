import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import { ethers } from 'ethers'
import { StringMap } from 'types'
import { ZERO_ADDRESS } from 'utils/addresses'
import {
  BackupBasket,
  Basket,
  RevenueSplit,
} from './../../components/rtoken-setup/atoms'

export const defaultValues = {
  // token params
  name: '',
  symbol: '',
  manifesto: '',
  ownerAddress: '',
  // backing params
  tradingDelay: '2160', // delay after default confirmed
  auctionLength: '900', // 15 minutes
  backingBuffer: '0.01', // 0.01%
  maxTradeSlippage: '1', // 1%
  issuanceRate: '0.025', // 0.025% per block or ~0.1% per minute
  scalingRedemptionRate: '5', // 5% per block
  redemptionRateFloor: '1000000', // Anticipated redemption minimum amount for throttling
  // other
  rewardPeriod: '604800', // 1 week
  rewardRatio: '0.02284', // approx. half life of 30 pay periods
  unstakingDelay: '1209600', // seconds 2 week
  minTrade: '0.01',
  maxTrade: '1000000',
  shortFreeze: '259200', // 3days
  longFreeze: '2592000', // 30days
  // governance
  defaultGovernance: true,
  unpause: '0',
  votingDelay: '5', // 5 blocks
  votingPeriod: '18000', // 100 blocks
  proposalThresholdAsMicroPercent: '1', // 1%
  quorumPercent: '4', // 4%
  minDelay: '24', // 24 hours -> 86400
  guardian: '',
  pauser: '',
  owner: '',
}

export interface RTokenConfiguration {
  name: string
  symbol: string
  mandate: string
  params: {
    minTradeVolume: BigNumber
    rTokenMaxTradeVolume: BigNumber
    dist: {
      rTokenDist: BigNumber
      rsrDist: BigNumber
    }
    rewardPeriod: BigNumber
    rewardRatio: BigNumber
    unstakingDelay: BigNumber
    tradingDelay: BigNumber
    auctionLength: BigNumber
    backingBuffer: BigNumber
    maxTradeSlippage: BigNumber
    shortFreeze: BigNumber
    longFreeze: BigNumber
    issuanceRate: BigNumber
    scalingRedemptionRate: BigNumber
    redemptionRateFloor: BigNumber
  }
}

export interface BackupBasketConfiguration {
  backupUnit: string
  diversityFactor: BigNumber
  backupCollateral: string[]
}

export interface BasketConfiguration {
  assets: string[]
  primaryBasket: string[]
  weights: BigNumber[]
  backups: BackupBasketConfiguration[]
}

export const getDeployParameters = (
  tokenConfig: StringMap,
  basket: Basket,
  backup: BackupBasket,
  revenueSplit: RevenueSplit
): [RTokenConfiguration, BasketConfiguration] | null => {
  try {
    // RToken configuration parameters
    const config: RTokenConfiguration = {
      name: tokenConfig.name,
      symbol: tokenConfig.ticker,
      mandate: tokenConfig.mandate,
      params: {
        minTradeVolume: parseEther(tokenConfig.minTrade.toString()),
        rTokenMaxTradeVolume: parseEther(tokenConfig.maxTrade.toString()),
        // TODO: New revenue split format
        dist: {
          rTokenDist: BigNumber.from(revenueSplit.holders),
          rsrDist: BigNumber.from(revenueSplit.stakers),
        },
        rewardPeriod: BigNumber.from(tokenConfig.rewardPeriod),
        rewardRatio: parseEther(tokenConfig.rewardRatio),
        unstakingDelay: BigNumber.from(tokenConfig.unstakingDelay),
        tradingDelay: BigNumber.from(tokenConfig.tradingDelay),
        auctionLength: BigNumber.from(tokenConfig.auctionLength),
        backingBuffer: parseEther(
          (Number(tokenConfig.backingBuffer) / 100).toString()
        ),
        maxTradeSlippage: parseEther(
          (Number(tokenConfig.maxTradeSlippage) / 100).toString()
        ),
        issuanceRate: parseEther(
          (Number(tokenConfig.issuanceRate) / 100).toString()
        ),
        shortFreeze: BigNumber.from(tokenConfig.shortFreeze),
        longFreeze: BigNumber.from(tokenConfig.longFreeze),
        scalingRedemptionRate: parseEther(
          (Number(tokenConfig.scalingRedemptionRate) / 100).toString()
        ),
        redemptionRateFloor: parseEther(tokenConfig.redemptionRateFloor),
      },
    }

    // Basket configuration
    const assets: Set<string> = new Set()
    const primaryBasket: string[] = []
    const weights: BigNumber[] = []
    const backups: BackupBasketConfiguration[] = []

    for (const targetUnit of Object.keys(basket)) {
      const { collaterals, distribution, scale } = basket[targetUnit]

      collaterals.forEach((collateral, index) => {
        primaryBasket.push(collateral.address)
        if (collateral.rewardToken && collateral.rewardToken !== ZERO_ADDRESS) {
          assets.add(collateral.rewardToken)
        }

        weights.push(
          parseEther(
            ((Number(distribution[index]) / 100) * Number(scale)).toString()
          )
        )
      })

      if (backup[targetUnit] && backup[targetUnit].collaterals.length) {
        backups.push({
          backupUnit: ethers.utils.formatBytes32String(
            targetUnit.toUpperCase()
          ),
          diversityFactor: parseEther(
            backup[targetUnit].diversityFactor.toString()
          ),
          backupCollateral: backup[targetUnit].collaterals.map((c) => {
            if (c.rewardToken && c.rewardToken !== ZERO_ADDRESS) {
              assets.add(c.rewardToken)
            }
            return c.address
          }),
        })
      }
    }

    const basketConfig: BasketConfiguration = {
      assets: Array.from(assets),
      primaryBasket,
      weights,
      backups,
    }

    return [config, basketConfig]
  } catch (e) {
    // TODO: Handle error case here
    console.error('Error deploying rToken', e)

    return null
  }
}
