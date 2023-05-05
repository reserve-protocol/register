import { Container } from 'components'
import InfoIcon from 'components/icons/InfoIcon'
import { useAtomValue } from 'jotai'
import { Box, Grid, Text } from 'theme-ui'
import About from './components/about'
import Balances from './components/balances'
import Issue from './components/issue'
import IssuanceInfo from './components/issue/IssuanceInfo'
import Redeem from './components/redeem'
import Zap from './components/zap'
import ZapToggle from './components/zap/components/ZapToggle'
import ZapTokenSelector from './components/zap/components/ZapTokenSelector'
import { ui, zapAvailableAtom } from './components/zap/state/ui-atoms'
import { ErrorBoundary } from 'react-error-boundary'

const ZapOverview = () => {
  const isZapEnabled = useAtomValue(ui.zapWidgetEnabled)
  const isZapAvailable = useAtomValue(zapAvailableAtom)

  return (
    <>
      {isZapAvailable && <ZapToggle />}
      {isZapEnabled && <ZapTokenSelector />}
    </>
  )
}

const ZapWarning = () => (
  <Box
    sx={{
      borderBottom: '1px dotted',
      borderColor: 'warning',
      textAlign: 'center',
      justifyContent: 'center',
      color: 'warning',
      fontSize: 1,
    }}
    p={3}
    variant="layout.verticalAlign"
  >
    <InfoIcon />
    <Text variant="strong" mx={2}>
      Warning:
    </Text>
    <Text sx={{ color: 'text' }}>
      The Zap Mint feature is in beta and may result in unexpected behavior.
      Proceed with caution.
    </Text>
  </Box>
)

/**
 * Mint & Redeem view
 */
const Issuance = () => {
  // TODO: Temporal until zaps is available for redeem
  // Keep old redeem component while hiding the issuance and tweaking the layout
  const isZapEnabled = useAtomValue(ui.zapWidgetEnabled)

  return (
    <>
      {isZapEnabled && <ZapWarning />}
      <Container pb={4}>
        <Grid columns={[1, 1, 1, '2fr 1.5fr']} gap={[3, 5]}>
          <Box>
            <ErrorBoundary fallback={null}>
              <ZapOverview />
            </ErrorBoundary>
            <Grid columns={[1, 2]} gap={4} mb={4}>
              {isZapEnabled ? <Zap /> : <Issue />}
              <Redeem />
            </Grid>
            <Balances />
          </Box>
          <Box>
            <IssuanceInfo mb={4} />
            <About />
          </Box>
        </Grid>
      </Container>
    </>
  )
}

export default Issuance
