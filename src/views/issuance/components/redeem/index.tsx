import { Trans } from '@lingui/macro'
import { Button, Card } from 'components'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { ReserveToken } from 'types'
import { isValidRedeemAmountAtom } from 'views/issuance/atoms'
import ConfirmRedemption from './ConfirmRedemption'
import RedeemInput from './RedeemInput'

const Redeem = ({ data, ...props }: { data: ReserveToken }) => {
  const [confirming, setConfirming] = useState(false)
  const isValid = useAtomValue(isValidRedeemAmountAtom)

  return (
    <>
      {confirming && <ConfirmRedemption onClose={() => setConfirming(false)} />}
      <Card p={4} {...props}>
        <RedeemInput />
        <Button
          disabled={!isValid}
          sx={{ width: '100%' }}
          mt={3}
          onClick={() => setConfirming(true)}
        >
          <Trans>- Redeem {data.symbol}</Trans>
        </Button>
      </Card>
    </>
  )
}

export default Redeem
