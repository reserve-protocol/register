import { useWeb3React } from '@web3-react/core'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Box } from 'theme-ui'
import { backupCollateralAtom, basketAtom, deployIdAtom } from './atoms'
import { deployStepAtom } from './components/DeployHeader'
import DeploymentStepTracker from './components/DeployStep'
import BasketView from './views/Basket'
import ConfirmDeploy from './views/ConfirmDeploy'
import DeployStatus from './views/DeployStatus'
import Intro from './views/Intro'
import TokenParameters from './views/TokenParameters'

const defaultValues = {
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
  rTokenDist: 40, // reward dist %
  rsrDist: 60, // reward dist %
  rewardPeriod: '604800', // 1 week
  rewardRatio: '0.02284', // approx. half life of 30 pay periods
  unstakingDelay: '1209600', // seconds 2 week
  minTrade: '0.01',
  maxTrade: '1000000',
  shortFreeze: '259200', // 3days
  longFreeze: '2592000', // 30days
}

const DeploymentViews = [
  Intro,
  BasketView,
  TokenParameters,
  ConfirmDeploy,
  DeployStatus,
]

const Deploy = () => {
  const { account } = useWeb3React()
  const setBasket = useUpdateAtom(basketAtom)
  const setBackupBasket = useUpdateAtom(backupCollateralAtom)
  const [currentView, setCurrentView] = useAtom(deployStepAtom)
  const form = useForm({
    mode: 'onChange',
    defaultValues,
  })

  // current tab view [config - basket]
  const View = DeploymentViews[currentView]

  useEffect(() => {
    if (account) {
      form.setValue('ownerAddress', account)
    }
  }, [account])

  useEffect(() => {
    return () => {
      setCurrentView(0)
      setBasket({})
      setBackupBasket({})
    }
  }, [])

  return (
    <FormProvider {...form}>
      <Box sx={{ width: '100%' }}>
        <DeploymentStepTracker step={currentView} />
        <Box sx={{ width: 1180, margin: 'auto' }} mb={7}>
          {View && <View />}
        </Box>
      </Box>
    </FormProvider>
  )
}

export default Deploy
