import { useWeb3React } from '@web3-react/core'
import { Container } from 'components'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { isValidBasketAtom } from './atoms'
import BasketSetup from './components/BasketSetup'
import DeployHeader from './components/DeployHeader'
import DeployPreview from './components/DeployPreview'
import TokenConfiguration from './components/TokenConfiguration'

const defaultValues = {
  // token params
  name: '',
  symbol: '',
  ownerAddress: '',
  // backing params
  tradingDelay: '0', // delay after default confirmed
  auctionLength: '900', // 15 minutes
  backingBuffer: '0.0001', // 0.01%
  maxTradeSlippage: '0.01', // 1%
  dustAmount: '0.01',
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

const VIEWS = [TokenConfiguration, BasketSetup, DeployPreview]

const Deploy = () => {
  const { account } = useWeb3React()
  const [view, setView] = useState(0)
  const form = useForm({
    mode: 'onBlur',
    defaultValues,
  })
  const [isValidBasket] = useAtomValue(isValidBasketAtom)

  // current tab view [config - basket]
  const View = VIEWS[view]

  useEffect(() => {
    if (account) {
      form.setValue('ownerAddress', account)
    }
  }, [account])

  // TODO
  const handleDeploy = () => {}

  return (
    <FormProvider {...form}>
      <Container sx={{ maxWidth: 1024, margin: 'auto' }} mb={2}>
        <DeployHeader
          mt={2}
          mb={5}
          isValid={form.formState.isValid && isValidBasket}
          currentView={view}
          onViewChange={setView}
          onDeploy={handleDeploy}
        />
        {View && <View onViewChange={setView} />}
      </Container>
    </FormProvider>
  )
}

export default Deploy
