import { Trans } from '@lingui/macro'
import { Button } from 'components'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { BoxProps, Card } from 'theme-ui'
import { isValidStakeAmountAtom } from 'views/staking/atoms'
import ConfirmStake from './ConfirmStake'
import StakeInput from './StakeInput'

const Stake = (props: BoxProps) => {
  const [confirming, setConfirming] = useState(false)
  const isValid = useAtomValue(isValidStakeAmountAtom)

  return (
    <>
      {confirming && <ConfirmStake onClose={() => setConfirming(false)} />}
      <Card p={4} {...props}>
        <StakeInput />
        <Button
          disabled={!isValid}
          sx={{ width: '100%' }}
          mt={3}
          onClick={() => setConfirming(true)}
        >
          + <Trans>Stake RSR</Trans>
        </Button>
      </Card>
    </>
  )
}

export default Stake
