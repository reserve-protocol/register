import { Trans } from '@lingui/macro'
import { Button, Card } from 'components'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { Text } from 'theme-ui'
import { isValidRedeemAmountAtom } from 'views/issuance/atoms'
import ConfirmRedemption from './ConfirmRedemption'
import RedeemInput from './RedeemInput'

const Redeem = () => {
  const rToken = useRToken()
  const [confirming, setConfirming] = useState(false)
  const isValid = useAtomValue(isValidRedeemAmountAtom)

  return (
    <>
      {confirming && <ConfirmRedemption onClose={() => setConfirming(false)} />}
      <Card p={4} sx={{ height: 'fit-content', position: 'relative' }}>
        <RedeemInput compact={false} />
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
