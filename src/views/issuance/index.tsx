import { Container } from 'components'
import { useAtomValue } from 'jotai'
import { Box, Grid } from 'theme-ui'
import About from './components/about'
import Balances from './components/balances'
import Issue from './components/issue'
import Redeem from './components/redeem'
import Zap from './components/zap'
import ZapToggle from './components/zap/components/ZapToggle'
import ZapTokenSelector from './components/zap/components/ZapTokenSelector'
import { ui, zapAvailableAtom } from './components/zap/state/ui-atoms'

/**
 * Mint & Redeem view
 */
const Issuance = () => {
  // TODO: Temporal until zaps is available for redeem
  // Keep old redeem component while hiding the issuance and tweaking the layout
  const isZapEnabled = useAtomValue(ui.zapWidgetEnabled)
  const isZapAvailable = useAtomValue(zapAvailableAtom)

  return (
    <Container pb={4}>
      <Grid columns={[1, 1, 1, '2fr 1.5fr']} gap={[3, 5]}>
        <Box>
          {isZapAvailable && <ZapToggle />}
          {isZapEnabled && <ZapTokenSelector />}
          <Grid columns={[1, 2]} gap={4} mb={4}>
            {isZapEnabled ? <Zap /> : <Issue />}
            <Redeem />
          </Grid>
          <Balances />
        </Box>
        <About />
      </Grid>
    </Container>
  )
}

export default Issuance
