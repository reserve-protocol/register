import { useWeb3React } from '@web3-react/core'
import { Container } from 'components'
import { useFacadeContract } from 'hooks/useContract'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Box } from 'theme-ui'
import { StringMap } from 'types'
import { BackupBasket, Basket, isValidBasketAtom } from './atoms'
import BasketSetup from './components/BasketSetup'
import ConfirmDeployModal from './components/ConfirmDeployModal'
import DeployHeader from './components/DeployHeader'
import DeployPreview from './components/DeployPreview'
import DeploySummary from './components/DeploySummary'
import TokenConfiguration from './components/TokenConfiguration'

const defaultValues = {
  // token params
  name: '',
  symbol: '',
  ownerAddress: '',
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

const Deploying = () => {
  return <Box></Box>
}

const VIEWS = [TokenConfiguration, BasketSetup, DeployPreview, DeploySummary]

const Deploy = () => {
  const { account } = useWeb3React()
  const [view, setView] = useState(0)
  const [confirmModal, setConfirmModal] = useState(false)
  const form = useForm({
    mode: 'onChange',
    defaultValues,
  })

  const facadeContract = useFacadeContract()

  const deployRToken = useCallback(
    (tokenConfig: StringMap, basket: Basket, backup: BackupBasket) => {
      if (facadeContract) {
      }
    },
    [facadeContract]
  )

  // current tab view [config - basket]
  const View = VIEWS[view]

  useEffect(() => {
    if (account) {
      form.setValue('ownerAddress', account)
    }
  }, [account])

  // TODO:
  // Handle deployment send transaction
  const handleDeploy = () => {}

  return (
    <FormProvider {...form}>
      <Container sx={{ maxWidth: 1024, margin: 'auto' }} mb={2}>
        <DeployHeader
          mt={2}
          mb={5}
          isValid={form.formState.isValid}
          currentView={view}
          onViewChange={setView}
          onDeploy={() => setConfirmModal(true)}
        />
        {View && <View onViewChange={setView} />}
      </Container>
      {confirmModal && (
        <ConfirmDeployModal
          onConfirm={handleDeploy}
          onClose={() => setConfirmModal(false)}
        />
      )}
    </FormProvider>
  )
}

export default Deploy
