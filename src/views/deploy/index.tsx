import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import { useWeb3React } from '@web3-react/core'
import { Container } from 'components'
import { useFacadeContract } from 'hooks/useContract'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Box } from 'theme-ui'
import { StringMap } from 'types'
import {
  BackupBasket,
  backupCollateralAtom,
  Basket,
  basketAtom,
  Collateral,
} from './atoms'
import BasketSetup from './components/BasketSetup'
import DeployHeader, { deployStepAtom } from './components/DeployHeader'
import DeployIntro from './components/DeployIntro'
import DeployPreview from './components/DeployPreview'
import DeploymentStepTracker from './components/DeployStep'
import DeploySummary from './components/DeploySummary'
import TokenConfiguration from './components/TokenConfiguration'

const defaultValues = {
  // token params
  name: '',
  symbol: '',
  ownerAddress: '', // TODO: additional param
  // backing params
  tradingDelay: '0', // delay after default confirmed
  auctionLength: '900', // 15 minutes
  backingBuffer: '0.01', // 0.01%
  maxTradeSlippage: '0.01', // 1%
  dustAmount: '1',
  issuanceRate: '0.00025',
  // other
  maxTradeVolume: '1000000',
  rTokenDist: 40, // reward dist %
  rsrDist: 60, // reward dist %
  rewardPeriod: '604800', // 1 week
  rewardRatio: '0.02284', // ? ask
  unstakingDelay: '1209600', // seconds 2 week
  oneshotPauseDuration: '864000', // seconds 10 days
  minBidSize: '1',
}

interface Configuration {
  name: string
  symbol: string
  tradingDelay: BigNumber
  auctionLength: BigNumber
  backingBuffer: BigNumber
  maxTradeSlippage: BigNumber
  dustAmount: BigNumber
  issuanceRate: BigNumber
  maxTradeVolume: BigNumber
  rTokenDist: BigNumber
  rsrDist: BigNumber
  rewardPeriod: BigNumber
  rewardRatio: BigNumber
  unstakingDelay: BigNumber
  oneshotPauseDuration: BigNumber
  minBidSize: BigNumber
}

type AddressMap = [string[], string[]]
type WeightMap = [BigNumber[], BigNumber[]]

function deploy(
  owner: string,
  config: Configuration,
  primaryBasket: AddressMap,
  weights: WeightMap,
  backupCollateral: AddressMap[],
  backupUnits: string[],
  diversityFactor: BigNumber[]
) {}

const VIEWS = [TokenConfiguration, BasketSetup, DeployPreview, DeploySummary]

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

const DeploymentViews = [
  DeployIntro,
  BasketSetup,
  TokenConfiguration,
  DeployPreview,
  // DeployTransaction
  DeploySummary,
]

const Deploy = () => {
  const { account } = useWeb3React()
  const currentView = useAtomValue(deployStepAtom)
  const [confirmModal, setConfirmModal] = useState(false)
  const form = useForm({
    mode: 'onChange',
    defaultValues,
  })
  const primaryBasket = useAtomValue(basketAtom)
  const backupBasket = useAtomValue(backupCollateralAtom)

  const facadeContract = useFacadeContract()

  const deployRToken = useCallback(
    (tokenConfig: StringMap, basket: Basket, backup: BackupBasket) => {
      const {
        backingBuffer,
        maxTradeSlippage,
        name,
        symbol,
        ownerAddress,
        ...params
      } = tokenConfig

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
    },
    [facadeContract]
  )

  // current tab view [config - basket]
  const View = DeploymentViews[currentView]

  useEffect(() => {
    if (account) {
      form.setValue('ownerAddress', account)
    }
  }, [account])

  // TODO:
  // Handle deployment send transaction
  const handleDeploy = () => {
    deployRToken(form.getValues(), primaryBasket, backupBasket)
  }

  return (
    <FormProvider {...form}>
      <DeploymentStepTracker step={currentView} />
      <Box sx={{ width: 1024, margin: 'auto' }} mb={3}>
        <DeployHeader my={5} />
        {View && <View />}
      </Box>
    </FormProvider>
  )
}

export default Deploy
