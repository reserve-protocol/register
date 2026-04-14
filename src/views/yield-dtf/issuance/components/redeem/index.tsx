import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import useRToken from 'hooks/useRToken'
import { Card } from '@/components/ui/card'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { isValidRedeemAmountAtom } from '@/views/yield-dtf/issuance/atoms'
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
      <Card className="p-4 h-fit relative border-2 border-secondary">
        <RedeemInput compact={false} />
        <Button
          disabled={!isValid}
          className="w-full mt-4"
          onClick={() => setConfirming(true)}
        >
          <Trans>- Redeem {rToken?.symbol ?? ''}</Trans>
        </Button>
      </Card>
    </>
  )
}

export default Redeem
