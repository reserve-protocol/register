import { Box, Grid } from 'theme-ui'
import About from './components/about'
import Balances from './components/balances'
import Issue from './components/issue'
import IssuanceInfo from './components/issue/IssuanceInfo'
import Redeem from './components/redeem'
import WrapSidebar from './components/wrapping/WrapSidebar'
import RTokenZapIssuance from './components/zapV2/RTokenZapIssuance'
import ZapToggle from './components/zapV2/ZapToggle'
import { ZapProvider, useZap } from './components/zapV2/context/ZapContext'

const IssuanceMethods = () => {
  const { zapEnabled, setZapEnabled } = useZap()

  return (
    <Grid columns={[1, 1, 1, '2fr 1.5fr']} gap={[1, 5]}>
      {zapEnabled ? (
        <RTokenZapIssuance />
      ) : (
        <Box>
          <ZapToggle zapEnabled={zapEnabled} setZapEnabled={setZapEnabled} />
          <Grid columns={[1, 2]} gap={[1, 4]} mb={[1, 4]}>
            <Issue />
            <Redeem />
          </Grid>
          <Balances />
        </Box>
      )}
      <Box>
        <IssuanceInfo mb={[1, 4]} />
        {!zapEnabled && <About />}
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
      <Box variant="layout.tokenView">
        <IssuanceMethods />
      </Box>
    </ZapProvider>
  )
}

export default Issuance
