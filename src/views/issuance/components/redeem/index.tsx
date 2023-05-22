import { Trans } from '@lingui/macro'
import { Button, Card } from 'components'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { Text } from 'theme-ui'
import { isValidRedeemAmountAtom } from 'views/issuance/atoms'
import { ui } from '../zap/state/ui-atoms'
import ConfirmRedemption from './ConfirmRedemption'
import RedeemInput from './RedeemInput'

const Redeem = () => {
  const rToken = useRToken()
  const [confirming, setConfirming] = useState(false)
  const isValid = useAtomValue(isValidRedeemAmountAtom)
  // TODO: Temporal until redeem zap is available
  const isZapEnabled = useAtomValue(ui.zapWidgetEnabled)

  return (
    <>
      {confirming && <ConfirmRedemption onClose={() => setConfirming(false)} />}
      <Card p={4} sx={{ height: 'fit-content' }}>
        <RedeemInput compact={false} />
        {isZapEnabled && (
          <Text
            mt={2}
            variant="legend"
            ml={3}
            sx={{ fontSize: 1, display: 'block' }}
          >
            <Trans>Redeem zaps are not yet supported</Trans>
          </Text>
        )}
        <Button
          disabled={!isValid}
          sx={{ width: '100%' }}
          mt={3}
          onClick={() => setConfirming(true)}
        >
          <Trans>- Redeem {rToken?.symbol ?? ''}</Trans>
        </Button>
      </Card>
    </>
  )
}

export default Redeem
