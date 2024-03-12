import { Trans } from '@lingui/macro'
import { type Token } from '@reserve-protocol/token-zapper'
import useRToken from 'hooks/useRToken'
import { useAtom, useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { useState } from 'react'
import { Box, Card, Text } from 'theme-ui'
import ConfirmZap from './components/ConfirmZap'
import { UnsupportedZap } from './components/UnsupportedZap'
import ZapButton from './components/ZapButton'
import ZapInput from './components/ZapInput'
import RedeemZapInput from './components/ZapRedeemInput'
import { ZapSettings } from './components/ZapSettings'
import { selectedZapTokenAtom } from './state/atoms'
import { ui } from './state/ui-atoms'
import RedeemZapButton from './components/RedeemZapButton'

/**
 * Zap widget
 */
export const ZapWidget = ({
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
  const unsupported =
    isZapEnabled === 'failed' || isZapEnabled === 'not-supported'
  const checkingIfZapEnabled = isZapEnabled === 'loading'

  const [open, setOpen] = useAtom(ui.zapSettingsOpen)

  return (
    <>
      <Card p={4}>
        <ZapSettings open={open} setOpen={setOpen} />
        <ZapInput disabled={unsupported || checkingIfZapEnabled} />
        <Box mt={3}>
          <ZapButton
            disabled={unsupported || checkingIfZapEnabled}
            onClick={handleClick}
          />
        </Box>
        {checkingIfZapEnabled && (
          <Text mx={3} mt={3} variant="strong">
            <Trans>Checking if token is supported...</Trans>
          </Text>
        )}
        {unsupported && (
          <UnsupportedZap missingTokenSupport={missingTokenSupport} />
        )}
      </Card>
      {isZapping && <ConfirmZap onClose={() => setZapping(false)} />}
    </>
  )
}

export const ZapRedeemWidget = () => {
  const [open, setOpen] = useAtom(ui.zapRedeemSettingsOpen)

  return (
    <>
      <Card p={4}>
        <ZapSettings open={open} setOpen={setOpen} />
        <RedeemZapInput />
        <RedeemZapButton />
      </Card>
    </>
  )
}
