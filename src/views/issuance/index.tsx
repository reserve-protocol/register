import { Container } from 'components'
import InfoIcon from 'components/icons/InfoIcon'
import { useAtomValue } from 'jotai'
import { Box, Grid, Text, Flex, Card } from 'theme-ui'
import About from './components/about'
import Balances from './components/balances'
import Issue from './components/issue'
import IssuanceInfo from './components/issue/IssuanceInfo'
import Redeem from './components/redeem'
import Zap from './components/zap'
import ZapToggle from './components/zap/components/ZapToggle'
import ZapTokenSelector from './components/zap/components/ZapTokenSelector'
import { ui, zapAvailableAtom } from './components/zap/state/ui-atoms'
import WrapSidebar from './components/wrapping/WrapSidebar'
import { useWalletClient } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ConnectWalletButton } from 'components/button/TransactionButton'

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
  <Flex
    sx={{
      textAlign: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      color: 'warning',
      fontSize: 1,
    }}
    p={4}
    mt={4}
  >
    <InfoIcon />
    <Text variant="strong" mx={2}>
      Warning:
    </Text>
    <Text sx={{ color: 'text' }}>
      The Zap Mint feature is in beta and may result in unexpected behavior.
      Proceed with caution.
    </Text>
  </Flex>
)

/**
 * Mint & Redeem view
 */
const Issuance = () => {
  const enableZapper = useWalletClient().data?.account != null
  // TODO: Temporal until zaps is available for redeem
  // Keep old redeem component while hiding the issuance and tweaking the layout
  const isZapEnabled = useAtomValue(ui.zapWidgetEnabled)

  if (!enableZapper && isZapEnabled) {
    return (
      <>
        {isZapEnabled && <ZapWarning />}
        <WrapSidebar />
        <Container pb={[1, 4]}>
          <Grid columns={[1, 1, 1, '2fr 1.5fr']} gap={[1, 5]}>
            <Box>
              <ZapOverview />
              <Card p={4}>
                <Box
                  p={4}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text variant="strong" mb={2} style={{ textAlign: 'center' }}>
                    First connect your wallet
                  </Text>
                  <Text
                    as="p"
                    variant="legend"
                    style={{ textAlign: 'center' }}
                    mt={3}
                  >
                    Please connect your wallet to use the Zap Minter, which
                    allows you to mint using a single asset
                  </Text>
                  <Box sx={{ textAlign: 'center' }} mt={3}>
                    <ConnectWalletButton />
                  </Box>
                </Box>
              </Card>
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

  return (
    <>
      {isZapEnabled && <ZapWarning />}
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
