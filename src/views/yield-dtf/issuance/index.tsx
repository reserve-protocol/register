import { useAtomValue } from 'jotai'
import { rTokenStateAtom } from 'state/atoms'
import DisabledByGeolocationMessage from 'state/geolocation/DisabledByGeolocationMessage'
import { Box, Divider, Grid } from 'theme-ui'
import About from './components/about'
import Balances from './components/balances'
import Issue from './components/issue'
import IssuanceInfo from './components/issue/IssuanceInfo'
import Redeem from './components/redeem'
import {
  CollateralizationBanner,
  DisabledArbitrumBanner,
  MaintenanceBanner,
} from './components/warnings'
import WrapSidebar from './components/wrapping/WrapSidebar'
import RTokenZapIssuance from './components/zapV2/RTokenZapIssuance'
import ZapToggle from './components/zapV2/ZapToggle'
import ZapToggleBottom from './components/zapV2/ZapToggleBottom'
import { ZapProvider, useZap } from './components/zapV2/context/ZapContext'

const IssuanceMethods = () => {
  const { zapEnabled, setZapEnabled } = useZap()
  const { isCollaterized } = useAtomValue(rTokenStateAtom)

  return (
    <Grid columns={[1, 1, 1, '2fr 1.5fr']} gap={[1, 4]}>
      {zapEnabled ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <CollateralizationBanner ml="4" mb="-4" mt="4" />
          <MaintenanceBanner ml="4" mb="-4" mt="4" />
          <DisabledArbitrumBanner ml="4" mb="-4" mt="4" />
          <RTokenZapIssuance disableRedeem={!isCollaterized} />
          <ZapToggleBottom setZapEnabled={setZapEnabled} />
        </Box>
      ) : (
        <Box mt={4} ml={4} mr={[4, 4, 4, 0]}>
          <CollateralizationBanner mb="3" />
          <MaintenanceBanner mb="3" />
          <DisabledArbitrumBanner mb="3" />
          <ZapToggle zapEnabled={zapEnabled} setZapEnabled={setZapEnabled} />
          <DisabledByGeolocationMessage mb={4} />
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
