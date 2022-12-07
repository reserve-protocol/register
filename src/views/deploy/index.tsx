import { t } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import Navigation from 'components/section-navigation/Navigation'
import { Provider } from 'jotai'
import { useEffect, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Grid } from 'theme-ui'
import DeployOverview from './components/DeployOverview'
import RTokenSetup from './components/RTokenSetup'

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

const Deploy = () => {
  const { account } = useWeb3React()
  const form = useForm({
    mode: 'onChange',
    defaultValues,
  })

  // TODO: Listen for lang
  const sections = useMemo(
    () => [
      t`Intro`,
      t`Primary basket`,
      t`Emergency basket`,
      t`Revenue split`,
      t`RToken params`,
      t`Governance params`,
      t`Roles`,
    ],
    []
  )

  useEffect(() => {
    if (account) {
      form.setValue('ownerAddress', account)
    }
  }, [account])

  return (
    <Provider>
      <FormProvider {...form}>
        <Grid
          columns={['1fr', '1fr 1fr', '1.5fr 1fr', 'auto 1fr 420px']}
          gap={4}
          px={[4, 5]}
          pt={[4, 5]}
          sx={{
            height: '100%',
            position: 'relative',
            alignContent: 'flex-start',
          }}
        >
          <Navigation
            title={t`Step 1`}
            sections={sections}
            sx={{
              position: 'sticky',
              top: [4, 5],
              display: ['none', 'none', 'none', 'inherit'],
            }}
          />
          <RTokenSetup />
          <DeployOverview sx={{ position: 'sticky', top: [4, 5] }} />
        </Grid>
      </FormProvider>
    </Provider>
  )
}

export default Deploy
