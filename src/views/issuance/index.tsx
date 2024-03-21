import { Token } from '@reserve-protocol/token-zapper'
import { useAtomValue, useSetAtom } from 'jotai'
import { Component, Suspense, useEffect } from 'react'
import { blockAtom, gasFeeAtom } from 'state/atoms'
import { Box, Grid } from 'theme-ui'
import { useWalletClient } from 'wagmi'
import About from './components/about'
import Balances from './components/balances'
import Issue from './components/issue'
import IssuanceInfo from './components/issue/IssuanceInfo'
import Redeem from './components/redeem'
import WrapSidebar from './components/wrapping/WrapSidebar'
import { ZapRedeemWidget, ZapWidget } from './components/zap'
import { ZapOverview } from './components/zap/components/ZapOverview'
import { ZapUnavailable } from './components/zap/components/ZapUnavailable'
import { redoZapQuote, zapTransaction } from './components/zap/state/atoms'
import { ui, zapEnabledAtom } from './components/zap/state/ui-atoms'
import { resolvedZapState } from './components/zap/state/zapper'

const UpdateBlockAndGas = () => {
  const redo = useSetAtom(redoZapQuote)
  const zapState = useAtomValue(resolvedZapState)
  const block = useAtomValue(blockAtom)
  const gasPriceBn = useAtomValue(gasFeeAtom)
  const tx = useAtomValue(zapTransaction)
  const trigger = tx.state === 'hasData' ? tx.data : null
  useEffect(() => {
    if (trigger == null) {
      return
    }
    let timeout = setTimeout(() => {
      redo(Math.random())
    }, 12000)
    return () => {
      clearTimeout(timeout)
    }
  }, [trigger])
  useEffect(() => {
    if (zapState == null || block == null || gasPriceBn == null) {
      return
    }
    zapState.updateBlockState(block, gasPriceBn)
  }, [zapState, block, gasPriceBn])
  return null
}

class CatchErrors extends Component<{ children: any }> {
  state = {
    hasError: false,
  }
  constructor(props: any) {
    super(props)
  }
  componentDidCatch() {
    this.setState({ hasError: true })
  }

  render() {
    if (this.state.hasError) {
      return null
    }
    return <>{this.props.children}</>
  }
}

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
      <Box variant="layout.tokenView">
        <Grid columns={[1, 1, 1, '2fr 1.5fr']} gap={[1, 5]}>
          <Box>
            <ZapOverview />
            <Grid columns={[1, 2]} gap={[1, 4]} mb={[1, 4]}>
              {zapsEnabled === false ? (
                <>
                  <Issue />
                  <Redeem />
                </>
              ) : (
                <>
                  <CatchErrors>
                    <Suspense fallback={<></>}>
                      <UpdateBlockAndGas />
                    </Suspense>
                    <ZapWidget
                      isZapEnabled={isZapEnabled.state}
                      missingTokenSupport={
                        (isZapEnabled.missingTokens ?? []) as Token[]
                      }
                    />
                    <ZapRedeemWidget />
                  </CatchErrors>
                </>
              )}
            </Grid>
            <Balances />
          </Box>
          <Box>
            <IssuanceInfo mb={[1, 4]} />
            <About />
          </Box>
        </Grid>
      </Box>
    </>
  )
}

export default Issuance
