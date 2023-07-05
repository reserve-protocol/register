import { Trans } from '@lingui/macro'
import { Button } from 'components'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { BoxProps, Card } from 'theme-ui'
import mixpanel from 'mixpanel-browser'
import { isValidStakeAmountAtom } from 'views/staking/atoms'
import ConfirmStake from './ConfirmStake'
import StakeInput from './StakeInput'
import { rTokenAtom } from 'state/atoms'

const Stake = (props: BoxProps) => {
  const [confirming, setConfirming] = useState(false)
  const rToken = useAtomValue(rTokenAtom)
  const isValid = useAtomValue(isValidStakeAmountAtom)

  return (
    <>
      {confirming && <ConfirmStake onClose={() => setConfirming(false)} />}
      <Card p={4} {...props}>
        <StakeInput compact={false} />
        <Button
          disabled={!isValid}
          sx={{ width: '100%' }}
          mt={3}
          onClick={() => {
            mixpanel.track('Clicked Stake RSR', {
              RToken: rToken?.address.toLowerCase() ?? '',
            })
            setConfirming(true)
          }}
        >
          + <Trans>Stake RSR</Trans>
        </Button>
      </Card>
    </>
  )
}

export default Stake
