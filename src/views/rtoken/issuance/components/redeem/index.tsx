import { Trans } from '@lingui/macro'
import { Button, Card } from 'components'
import useRToken from 'hooks/useRToken'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { isValidRedeemAmountAtom } from 'views/issuance/atoms'
import ConfirmRedemption from './ConfirmRedemption'
import RedeemInput from './RedeemInput'
import { rTokenStateAtom } from 'state/atoms'
import { customRedeemNonceAtom, redeemNonceAtom } from './atoms'

const Redeem = () => {
  const rToken = useRToken()
  const [confirming, setConfirming] = useState(false)
  const isValid = useAtomValue(isValidRedeemAmountAtom)
  const { basketNonce, isCollaterized } = useAtomValue(rTokenStateAtom)
  const selectedNonce = useAtomValue(redeemNonceAtom)
  const setSelectedNonce = useSetAtom(customRedeemNonceAtom)

  useEffect(() => {
    if (!isCollaterized && basketNonce > 0 && basketNonce === selectedNonce) {
      setSelectedNonce(basketNonce - 1)
    }
  }, [basketNonce, isCollaterized])

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
