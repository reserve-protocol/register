import { Trans } from '@lingui/macro'
import { Button } from 'components'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { useState } from 'react'
import { BoxProps, Card } from 'theme-ui'
import { isValidStakeAmountAtom } from 'views/staking/atoms'
import ConfirmStake from './ConfirmStake'
import StakeInput from './StakeInput'

const Stake = (props: BoxProps) => {
  const [confirming, setConfirming] = useState(false)
  const rToken = useRToken()
  const isValid = useAtomValue(isValidStakeAmountAtom)

  const handleStake = () => {
    setConfirming(true)
    mixpanel.track('Clicked Stake RSR', {
      RToken: rToken?.address.toLowerCase() ?? '',
    })
  }

  return (
    <>
      {confirming && <ConfirmStake onClose={() => setConfirming(false)} />}
      <Card p={4} {...props}>
        <StakeInput compact={false} />
        <Button
          disabled={!isValid}
          sx={{ width: '100%' }}
          mt={3}
          onClick={handleStake}
        >
          + <Trans>Stake RSR</Trans>
        </Button>
      </Card>
    </>
  )
}

export default Stake
