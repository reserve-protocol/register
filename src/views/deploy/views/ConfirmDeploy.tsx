import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import { ethers } from 'ethers'
import useTransactionCost from 'hooks/useTransactionCost'
import { useAtom, useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { addTransactionAtom } from 'state/atoms'
import { StringMap } from 'types'
import { FACADE_WRITE_ADDRESS, ZERO_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import {
  BackupBasket,
  backupCollateralAtom,
  Basket,
  basketAtom,
  deployIdAtom,
} from '../atoms'
import DeployHeader, { deployStepAtom } from '../components/DeployHeader'
import DeployPreview from '../components/DeployPreview'

interface RTokenConfiguration {
  name: string
  symbol: string
  manifestoURI: string
  params: {
    tradingRange: {
      min: BigNumber
      max: BigNumber
    }
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
    issuanceRate: BigNumber
    freezeDuration: BigNumber
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
      manifestoURI: tokenConfig.manifesto,
      params: {
        tradingRange: {
          min: parseEther(tokenConfig.minTrade.toString()),
          max: parseEther(tokenConfig.maxTrade.toString()),
        },
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
        freezeDuration: BigNumber.from(tokenConfig.oneshotFreezeDuration),
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

// TODO: Error case estimating gas (transaction revert)
const ConfirmDeploy = () => {
  const { getValues } = useFormContext()
  const addTransaction = useSetAtom(addTransactionAtom)
  const deployId = useAtomValue(deployIdAtom)
  const primaryBasket = useAtomValue(basketAtom)
  const backupBasket = useAtomValue(backupCollateralAtom)
  const [current, setStep] = useAtom(deployStepAtom)

  const transaction = useMemo(() => {
    const params = getDeployParameters(getValues(), primaryBasket, backupBasket)

    if (!params) {
      return null
    }

    return {
      id: deployId,
      description: t`Deploy rToken`,
      status: TRANSACTION_STATUS.PENDING,
      value: '0',
      call: {
        abi: 'facadeWrite',
        address: FACADE_WRITE_ADDRESS[CHAIN_ID],
        method: 'deployRToken',
        args: params,
      },
    }
  }, [])

  const fee = useTransactionCost(transaction ? [transaction] : [])

  const handleDeploy = () => {
    if (transaction) {
      addTransaction([transaction])
      setStep(current + 1)
    }
  }

  return (
    <>
      <DeployHeader
        isValid={!!fee}
        title={t`RToken Summary`}
        subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        confirmText={fee ? t`Deploy RToken` : 'Validating...'}
        onConfirm={handleDeploy}
        gasCost={fee}
      />
      <DeployPreview />
    </>
  )
}

export default ConfirmDeploy
