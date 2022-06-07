import { useWeb3React } from '@web3-react/core'
import { Container } from 'components'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Box, Grid } from 'theme-ui'
import BackingForm from './components/BackingForm'
import OtherForm from './components/OtherForm'
import StakingToken from './components/StakingToken'
import TokenForm from './components/TokenForm'

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

const Deploy = () => {
  const { account } = useWeb3React()
  const form = useForm({
    mode: 'onBlur',
    defaultValues,
  })

  useEffect(() => {
    if (account) {
      form.setValue('ownerAddress', account)
    }
  }, [account])

  return (
    <FormProvider {...form}>
      <Container sx={{ maxWidth: 1024, margin: 'auto' }}>
        <Grid gap={5} columns={[1, 2]} mb={3}>
          <Box>
            <TokenForm mb={4} />
            <BackingForm mb={4} />
            <OtherForm />
          </Box>
          <Box>
            <StakingToken />
          </Box>
        </Grid>
      </Container>
    </FormProvider>
  )
}

export default Deploy
