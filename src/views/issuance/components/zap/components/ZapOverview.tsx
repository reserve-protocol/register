import { useAtomValue } from 'jotai'
import ZapToggle from './ZapToggle'
import { ui, zapAvailableAtom, zapEnabledAtom } from '../state/ui-atoms'
import ZapTokenSelector from './ZapTokenSelector'
import { Box, Card, Text, Image } from 'theme-ui'
import { Trans } from '@lingui/macro'

export const ZapOverview = () => {
  const zapToggledOn = useAtomValue(zapEnabledAtom)
  const isZapEnabled = useAtomValue(ui.zapWidgetEnabled)
  const isZapAvailable = useAtomValue(zapAvailableAtom)

  if (import.meta.env.VITE_ZAP_MAINTENANCE === 'true') {
    return (
      <Card p={4} mb={4} sx={{ background: 'infoBG', color: 'info' }}>
        <Box variant="layout.verticalAlign">
          <Image src="/svgs/asterisk.svg" height={16} width={16} />
          <Text ml={3}>
            <Trans>Zap functionality is under maintenance.</Trans>
          </Text>
        </Box>
      </Card>
    )
  }

  return (
    <>
      {isZapAvailable && <ZapToggle />}
      {zapToggledOn && isZapEnabled && <ZapTokenSelector />}
    </>
  )
}
