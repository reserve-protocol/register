import { Container } from 'components'
import { useAtomValue } from 'jotai'
import { walletAtom } from 'state/atoms'
import { Box, Grid } from 'theme-ui'
import About from './components/about'
import Balances from './components/balances'
import Issue from './components/issue'
import IssuanceInfo from './components/issue/IssuanceInfo'
import Redeem from './components/redeem'
import WrapSidebar from './components/wrapping/WrapSidebar'
import Zap from './components/zap'
import { ZapOverview } from './components/zap/components/ZapOverview'
import { ZapUnavailable } from './components/zap/components/ZapUnavailable'
import { ui } from './components/zap/state/ui-atoms'

/**
 * Mint & Redeem view
 */
const Issuance = () => {
  const enableZapper = !!useAtomValue(walletAtom)
  // TODO: Temporal until zaps is available for redeem
  // Keep old redeem component while hiding the issuance and tweaking the layout
  const isZapEnabled = useAtomValue(ui.zapWidgetEnabled)

  if (!enableZapper && isZapEnabled) {
    return <ZapUnavailable />
  }

  return (
    <>
      <WrapSidebar />
      <Container pb={[1, 4]}>
        <Grid columns={[1, 1, 1, '2fr 1.5fr']} gap={[1, 5]}>
          <Box>
            <ZapOverview />
            <Grid columns={[1, 2]} gap={[1, 4]} mb={[1, 4]}>
              {isZapEnabled ? <Zap /> : <Issue />}
              <Redeem zapEnabled={isZapEnabled} />
            </Grid>
            <Balances />
          </Box>
          <Box>
            <IssuanceInfo mb={[1, 4]} />
            <About />
          </Box>
        </Grid>
      </Container>
    </>
  )
}

export default Issuance
