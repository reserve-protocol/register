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
  tradingDelay: '',
  auctionLength: '',
  backingBuffer: '',
  maxTradeSlippage: '',
  dustAmount: '',
  issuanceRate: '',
  // other
  maxTradeVolume: '1000000',
  rTokenDist: '40', // %
  rsrDist: '60', // %
  rewardPeriod: '604800', // seconds
  rewardRatio: '0.02284', // ? ask
  unstakingDelay: '1209600', // seconds 1 week
  oneshotPauseDuration: '864000', // seconds 10 days
  minBidSize: '',
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
        <Grid gap={5} columns={[1, 2]}>
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
