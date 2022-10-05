import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import Alert from 'components/alert'
import { ethers } from 'ethers'
import useTransactionCost from 'hooks/useTransactionCost'
import { useAtom, useSetAtom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo } from 'react'
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
import { Steps } from '../components/DeployStep'

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

// TODO: Error case estimating gas (transaction revert)
const ConfirmDeploy = () => {
  const { getValues } = useFormContext()
  const addTransaction = useSetAtom(addTransactionAtom)
  const [deployId, setDeployId] = useAtom(deployIdAtom)
  const primaryBasket = useAtomValue(basketAtom)
  const backupBasket = useAtomValue(backupCollateralAtom)
  const setStep = useUpdateAtom(deployStepAtom)

  useEffect(() => {
    setDeployId(uuid())
  }, [])

  const transaction = useMemo(() => {
    const params = getDeployParameters(getValues(), primaryBasket, backupBasket)

    if (!params || !deployId) {
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
        args: params as any,
      },
    }
  }, [deployId])

  const [fee, gasError, gasLimit] = useTransactionCost(
    transaction ? [transaction] : []
  )

  const handleDeploy = () => {
    if (transaction) {
      transaction.call.args.push({
        gasLimit: Math.floor(gasLimit + gasLimit * 0.05),
      })
      addTransaction([transaction])
      setStep(Steps.DeployToken)
    }
  }

  const handleBack = () => {
    setStep(Steps.Parameters)
    setDeployId('')
  }

  return (
    <>
      <DeployHeader
        isValid={!!fee}
        title={t`RToken Summary`}
        subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        confirmText={fee ? t`Deploy RToken` : 'Validating...'}
        onBack={handleBack}
        onConfirm={handleDeploy}
        gasCost={fee}
      />
      {!!gasError && <Alert text={gasError} mb={5} />}
      <DeployPreview />
    </>
  )
}

export default ConfirmDeploy
