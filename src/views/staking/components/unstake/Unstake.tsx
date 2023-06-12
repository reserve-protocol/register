import { Trans } from '@lingui/macro'
import { Button } from 'components'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { BoxProps, Card } from 'theme-ui'
import { isValidUnstakeAmountAtom } from 'views/staking/atoms'
import ConfirmUnstake from './ConfirmUnstake'
import UnstakeInput from './UnstakeInput'
import { rTokenTradingAvailableAtom } from 'state/atoms'

const Unstake = (props: BoxProps) => {
  const [confirming, setConfirming] = useState(false)
  const isValid = useAtomValue(isValidUnstakeAmountAtom)
  const isAvailable = useAtomValue(rTokenTradingAvailableAtom)

  return (
    <>
      {confirming && <ConfirmUnstake onClose={() => setConfirming(false)} />}
      <Card p={4} {...props}>
        <UnstakeInput compact={false} />
        <Button
          disabled={!isValid || !isAvailable}
          sx={{ width: '100%' }}
          mt={3}
          onClick={() => setConfirming(true)}
        >
          - <Trans>Unstake stRSR</Trans>
        </Button>
      </Card>
    </>
  )
}

export default Unstake
