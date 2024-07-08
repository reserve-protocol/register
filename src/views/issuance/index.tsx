import { Box, BoxProps, Divider, Grid, Text } from 'theme-ui'
import About from './components/about'
import Balances from './components/balances'
import Issue from './components/issue'
import IssuanceInfo from './components/issue/IssuanceInfo'
import Redeem from './components/redeem'
import WrapSidebar from './components/wrapping/WrapSidebar'
import RTokenZapIssuance from './components/zapV2/RTokenZapIssuance'
import ZapToggle from './components/zapV2/ZapToggle'
import ZapToggleBottom from './components/zapV2/ZapToggleBottom'
import { ZapProvider, useZap } from './components/zapV2/context/ZapContext'
import { useAtomValue } from 'jotai'
import { rTokenStateAtom } from 'state/atoms'
import AlertIcon from 'components/icons/AlertIcon'
import mixpanel from 'mixpanel-browser'
import { useEffect } from 'react'

const CollateralizationBanner = (props: BoxProps) => {
  const { isCollaterized } = useAtomValue(rTokenStateAtom)

  if (isCollaterized) return null

  return (
    <Box {...props} variant="layout.borderBox" p="3">
      <Box variant="layout.verticalAlign">
        <AlertIcon width={32} height={32} />
        <Box ml="3">
          <Text sx={{ fontWeight: 'bold' }} variant="warning">
            RToken basket is under re-collateralization, this process can take a
            few hours.
          </Text>
          <br />
          <Text mt="1" sx={{ display: 'block' }} variant="warning">
            For redemptions, please wait until the process is complete or
            manually redeem using the previous basket.
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

const IssuanceMethods = () => {
  const { zapEnabled, setZapEnabled } = useZap()
  const { isCollaterized } = useAtomValue(rTokenStateAtom)

  return (
    <Grid columns={[1, 1, 1, '2fr 1.5fr']} gap={[1, 4]}>
      {zapEnabled ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <CollateralizationBanner ml="4" mb="-4" mt="4" />
          <RTokenZapIssuance disableRedeem={!isCollaterized} />
          <ZapToggleBottom setZapEnabled={setZapEnabled} />
        </Box>
      ) : (
        <Box mt={4} ml={4} mr={[4, 4, 4, 0]}>
          <CollateralizationBanner mb="3" />
          <ZapToggle zapEnabled={zapEnabled} setZapEnabled={setZapEnabled} />
          <Grid columns={[1, 2]} gap={[1, 4]} mb={[1, 4]}>
            <Issue />
            <Redeem />
          </Grid>
          <Balances />
        </Box>
      )}
      <Box
        sx={{
          borderLeft: ['none', 'none', 'none', '1px solid'],
          borderColor: ['border', 'border', 'border', 'border'],
          minHeight: ['auto', 'auto', 'auto', 'calc(100vh - 73px)'],
        }}
      >
        <IssuanceInfo mb={[1, 0]} />
        {!zapEnabled && (
          <>
            <Divider mx={4} my={0} sx={{ borderColor: 'borderSecondary' }} />
            <About />
          </>
        )}
      </Box>
    </Grid>
  )
}

/**
 * Mint & Redeem view
 */
const Issuance = () => {
  useEffect(() => {
    mixpanel.track('page_view', {
      page: 'rtoken_details',
      section: 'issuance',
      payload: {},
    })
  }, [])

  return (
    <ZapProvider>
      <WrapSidebar />
      <Box sx={{ width: '100', p: [1, 0] }}>
        <IssuanceMethods />
      </Box>
    </ZapProvider>
  )
}

export default Issuance
