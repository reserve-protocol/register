import { Token } from '@reserve-protocol/token-zapper'
import { Container } from 'components'
import { useAtomValue } from 'jotai'
import { Box, Grid } from 'theme-ui'
import { useWalletClient } from 'wagmi'
import About from './components/about'
import Balances from './components/balances'
import Issue from './components/issue'
import IssuanceInfo from './components/issue/IssuanceInfo'
import Redeem from './components/redeem'
import WrapSidebar from './components/wrapping/WrapSidebar'
import Zap from './components/zap'
import { ZapOverview } from './components/zap/components/ZapOverview'
import { ZapUnavailable } from './components/zap/components/ZapUnavailable'
import { ui, zapEnabledAtom } from './components/zap/state/ui-atoms'

/**
 * Mint & Redeem view
 */
const Issuance = () => {
  const client = useWalletClient()
  const isZapEnabled = useAtomValue(ui.zapWidgetEnabled)
  const zapsEnabled = useAtomValue(zapEnabledAtom)
  if (
    zapsEnabled === true &&
    ((client.status === 'idle' &&
      client.data?.account == null &&
      isZapEnabled.state !== 'disabled') ||
      (isZapEnabled.state !== 'loading' &&
        isZapEnabled.state !== 'disabled' &&
        client.data?.account == null))
  ) {
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
              {zapsEnabled === false ? (
                <Issue />
              ) : (
                <Zap
                  isZapEnabled={isZapEnabled.state}
                  missingTokenSupport={
                    (isZapEnabled.missingTokens ?? []) as Token[]
                  }
                />
              )}
              <Redeem zapEnabled={zapsEnabled} />
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
