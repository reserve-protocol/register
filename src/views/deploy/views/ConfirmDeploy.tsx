import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import { useAtomValue } from 'jotai/utils'
import { useCallback } from 'react'
import { useFormContext } from 'react-hook-form'
import { StringMap } from 'types'
import {
  BackupBasket,
  backupCollateralAtom,
  Basket,
  basketAtom,
  Collateral,
  isValidBasketAtom,
} from '../atoms'
import DeployHeader from '../components/DeployHeader'
import DeployPreview from '../components/DeployPreview'

export interface IConfig {
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
  oneshotFreezeDuration: BigNumber
}

export interface IRTokenConfig {
  name: string
  symbol: string
  manifestoURI: string
  params: IConfig
}

export interface IBackupInfo {
  backupUnit: string
  diversityFactor: BigNumber
  backupCollateral: string[]
}

export interface IRTokenSetup {
  assets: string[]
  primaryBasket: string[]
  weights: BigNumber[]
  backups: IBackupInfo[]
}

const getCollateralByType = (
  collaterals: Collateral[]
): [string[], string[]] => {
  return collaterals.reduce(
    (acc, collateral) => {
      acc[collateral.custom ? 1 : 0].push(collateral.address)
      return acc
    },
    [[] as string[], [] as string[]]
  )
}

// TODO: Token deployment
const ConfirmDeploy = () => {
  const {
    getValues,
    formState: { isValid },
  } = useFormContext()
  const [isValidBasket] = useAtomValue(isValidBasketAtom)

  const primaryBasket = useAtomValue(basketAtom)
  const backupBasket = useAtomValue(backupCollateralAtom)

  const deployRToken = useCallback(
    (tokenConfig: StringMap, basket: Basket, backup: BackupBasket) => {
      try {
        const params: IConfig = {
          tradingRange: {
            min: BigNumber.from(0),
            max: BigNumber.from(0),
          },
          dist: {
            rTokenDist: parseEther(tokenConfig.rTokenDist),
            rsrDist: parseEther(tokenConfig.rsrDist),
          },
          rewardPeriod: parseEther(tokenConfig.rewardPeriod),
          rewardRatio: parseEther(tokenConfig.rewardRatio),
          unstakingDelay: parseEther(tokenConfig.unstakingDelay),
          tradingDelay: parseEther(tokenConfig.tradingDelay),
          auctionLength: parseEther(tokenConfig.auctionLength),
          backingBuffer: parseEther(
            (Number(tokenConfig.backingBuffer) / 100).toString()
          ),
          maxTradeSlippage: parseEther(
            (Number(tokenConfig.maxTradeSlippage) / 100).toString()
          ),
          issuanceRate: parseEther(
            (Number(tokenConfig.issuanceRate) / 100).toString()
          ),
          oneshotFreezeDuration: parseEther(tokenConfig.oneshotFreezeDuration),
        }

        const config = {
          name,
          symbol,
          ownerAddress,
          backingBuffer: parseEther((Number(backingBuffer) / 100).toString()),
          maxTradeSlippage: parseEther(
            (Number(maxTradeSlippage) / 100).toString()
          ),
          ...Object.keys(params).reduce(
            (acc, key) => ({ ...acc, [key]: params[key] }),
            {} as StringMap
          ),
        }

        const basketCollaterals: [string[], string[]] = [[], []]
        const backupCollateral: [string[], string[]][] = []
        // TODO: Ask taylor how to get quantities? should I include scale?
        const quantities: [BigNumber[], BigNumber[]] = [[], []]
        const backupUnits: string[] = [] // USD / EUR
        const diversityFactor: number[] = [] // 3 / 2

        for (const targetUnit of Object.keys(basket)) {
          const { collaterals, distribution } = basket[targetUnit]

          collaterals.forEach((collateral, index) => {
            const arrayIndex = collateral.custom ? 1 : 0
            basketCollaterals[arrayIndex].push(collateral.address)
            // TODO: quantities parsing with scale?
            quantities[arrayIndex].push(
              parseEther(distribution[index].toString())
            )
          })

          if (backup[targetUnit] && backup[targetUnit].collaterals.length) {
            backupUnits.push(targetUnit)
            diversityFactor.push(backup[targetUnit].diversityFactor)
            backupCollateral.push(
              getCollateralByType(backup[targetUnit].collaterals)
            )
          }
        }

        // TODO: execute token contract
        console.log(
          'DATA',
          JSON.stringify([
            config,
            basketCollaterals,
            quantities,
            backupUnits,
            diversityFactor,
            backupCollateral,
          ])
        )
      } catch (e) {
        // TODO: Handle error case here
        console.error('Error deploying rToken', e)
      }
    },
    []
  )

  const handleDeploy = () => {
    deployRToken(getValues(), primaryBasket, backupBasket)
  }

  return (
    <>
      <DeployHeader
        isValid={isValid && isValidBasket}
        title={t`RToken Summary`}
        subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        confirmText={t`Deploy RToken`}
        onConfirm={handleDeploy}
      />
      <DeployPreview />
    </>
  )
}

export default ConfirmDeploy
