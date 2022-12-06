import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import { ethers } from 'ethers'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { StringMap } from 'types'
import { FACADE_WRITE_ADDRESS, ZERO_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { TRANSACTION_STATUS } from 'utils/constants'
import {
  BackupBasket,
  backupCollateralAtom,
  Basket,
  basketAtom,
  isBasketValidAtom,
  isRevenueValidAtom,
  revenueSplitAtom,
} from './../../components/rtoken-setup/atoms'

interface RTokenConfiguration {
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

interface BackupBasketConfiguration {
  backupUnit: string
  diversityFactor: BigNumber
  backupCollateral: string[]
}

interface BasketConfiguration {
  assets: string[]
  primaryBasket: string[]
  weights: BigNumber[]
  backups: BackupBasketConfiguration[]
}

export const getDeployParameters = (
  tokenConfig: StringMap,
  basket: Basket,
  backup: BackupBasket
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
        dist: {
          rTokenDist: BigNumber.from(tokenConfig.rTokenDist),
          rsrDist: BigNumber.from(tokenConfig.rsrDist),
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

const useDeployTx = () => {
  const {
    getValues,
    formState: { isValid },
  } = useFormContext()
  const isBasketValid = useAtomValue(isBasketValidAtom)
  const isRevenueSplitValid = useAtomValue(isRevenueValidAtom)
  const primaryBasket = useAtomValue(basketAtom)
  const backupBasket = useAtomValue(backupCollateralAtom)
  const revenueSplit = useAtomValue(revenueSplitAtom)
  const formFields = useWatch()

  return useMemo(() => {
    if (!isBasketValid || !isRevenueSplitValid || !isValid) {
      return null
    }

    const params = getDeployParameters(getValues(), primaryBasket, backupBasket)

    if (!params) {
      return null
    }

    return {
      id: '', // Assign when running tx
      description: t`Deploy RToken`,
      status: TRANSACTION_STATUS.PENDING,
      value: '0',
      call: {
        abi: 'facadeWrite',
        address: FACADE_WRITE_ADDRESS[CHAIN_ID],
        method: 'deployRToken',
        args: params as any,
      },
    }
  }, [primaryBasket, backupBasket, revenueSplit, JSON.stringify(formFields)])
}

export default useDeployTx
