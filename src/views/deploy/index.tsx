import { useWeb3React } from '@web3-react/core'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Box } from 'theme-ui'
import { deployStepAtom } from './components/DeployHeader'
import DeploymentStepTracker from './components/DeployStep'
import DeploySummary from './components/DeploySummary'
import BasketView from './views/Basket'
import ConfirmDeploy from './views/ConfirmDeploy'
import Intro from './views/Intro'
import TokenParameters from './views/TokenParameters'

const defaultValues = {
  // token params
  name: '',
  symbol: '',
  manifesto: '',
  ownerAddress: '',
  // backing params
  tradingDelay: '0', // delay after default confirmed
  auctionLength: '900', // 15 minutes
  backingBuffer: '0.01', // 0.01%
  maxTradeSlippage: '1', // 1%
  dustAmount: '1',
  issuanceRate: '0.025', // 0.025% per block or ~0.1% per minute
  // other
  rTokenDist: 40, // reward dist %
  rsrDist: 60, // reward dist %
  rewardPeriod: '604800', // 1 week
  rewardRatio: '0.02284', // approx. half life of 30 pay periods
  unstakingDelay: '1209600', // seconds 2 week
  oneshotFreezeDuration: '864000', // seconds 10 days
  minTrade: '0.01',
  maxTrade: '1000000',
}

const DeploymentViews = [
  Intro,
  BasketView,
  TokenParameters,
  ConfirmDeploy,
  // DeployTransaction
  DeploySummary,
]

const Deploy = () => {
  const { account } = useWeb3React()
  const currentView = useAtomValue(deployStepAtom)
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

  return (
    <FormProvider {...form}>
      <DeploymentStepTracker step={currentView} />
      <Box sx={{ width: 1024, margin: 'auto' }} mb={3}>
        {View && <View />}
      </Box>
    </FormProvider>
  )
}

export default Deploy
