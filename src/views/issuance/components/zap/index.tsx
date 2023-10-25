import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { Component, Suspense, useEffect, useState } from 'react'
import { blockAtom, gasFeeAtom } from 'state/atoms'
import { Box, Card, Flex, Link, Text } from 'theme-ui'
import ConfirmZap from './components/ConfirmZap'
import ZapButton from './components/ZapButton'
import ZapInput from './components/ZapInput'
import { ZapSettings } from './components/ZapSettings'
import { selectedZapTokenAtom } from './state/atoms'
import { resolvedZapState } from './state/zapper'
import { Trans, t } from '@lingui/macro'
import Help from 'components/help'
import { Token } from '@reserve-protocol/token-zapper'

const UpdateBlockAndGas = () => {
  const zapState = useAtomValue(resolvedZapState)
  const block = useAtomValue(blockAtom)
  const gasPriceBn = useAtomValue(gasFeeAtom)
  useEffect(() => {
    if (zapState == null || block == null || gasPriceBn == null) return
    if (block === zapState.currentBlock || gasPriceBn === zapState.gasPrice)
      return
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
 * Zap widget
 */
const Zap = ({
  isZapEnabled,
  missingTokenSupport,
}: {
  missingTokenSupport: Token[]
  isZapEnabled: 'loading' | 'failed' | 'enabled' | 'not-supported' | 'disabled'
}) => {
  const [isZapping, setZapping] = useState(false)
  const rToken = useRToken()
  const selectedToken = useAtomValue(selectedZapTokenAtom)
  const handleClick = () => {
    setZapping(true)
    mixpanel.track('Clicked Zap', {
      RToken: rToken?.address.toLowerCase() ?? '',
      inputToken: selectedToken?.symbol,
    })
  }
  const unsuppoed =
    isZapEnabled === 'failed' || isZapEnabled === 'not-supported'
  const checkingIfZapEnabled = isZapEnabled === 'loading'

  return (
    <CatchErrors>
      <Suspense fallback={<></>}>
        <UpdateBlockAndGas />
      </Suspense>
      <Card p={4}>
        <ZapSettings />
        <ZapInput disabled={unsuppoed || checkingIfZapEnabled} />
        <ZapButton
          disabled={unsuppoed || checkingIfZapEnabled}
          onClick={handleClick}
        />
        {checkingIfZapEnabled && (
          <Text mx={3} mt={3} variant="strong">
            <Trans>Checking if token is supported...</Trans>
          </Text>
        )}
        {unsuppoed && (
          <>
            <Flex
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              mt={3}
              mx={3}
            >
              <Text variant="strong">
                <Trans>Zaps not available for token</Trans>
              </Text>
              <Help
                content={t`The zapper does not currently work with this RToken. This is usually because the basket contains collateral that is not yet supported. Additional collateral types are being expanded over time.`}
              />
            </Flex>
            {missingTokenSupport.length !== 0 && (
              <>
                <Box mx={3} mt={3}>
                  <Text>
                    <Trans>Unsupported collaterals:</Trans>
                  </Text>
                </Box>
                {missingTokenSupport.map((token) => (
                  <Box ml={4} key={token.address.address} mr={3}>
                    <Text>&#x2022; {token.symbol}</Text>
                  </Box>
                ))}
              </>
            )}
            <Text
              mx={3}
              mt={2}
              variant="strong"
              sx={{ fontSize: 12 }}
              color="error"
            >
              <Trans>
                The zapper is opensourced and anyone can add new
                collateral/request support here:{' '}
              </Trans>{' '}
              <Link
                target="_blank"
                href={'https://github.com/reserve-protocol/token-zapper/issues'}
              >
                Zapper repository
              </Link>
            </Text>
          </>
        )}
      </Card>
      {isZapping && <ConfirmZap onClose={() => setZapping(false)} />}
    </CatchErrors>
  )
}

export default Zap
