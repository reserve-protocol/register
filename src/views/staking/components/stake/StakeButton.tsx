import { Trans } from '@lingui/macro'
import { Button } from 'components'
import { TransactionButtonContainer } from 'components/button/TransactionButton'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { useCallback, useState } from 'react'
import { selectedRTokenAtom } from 'state/atoms'
import { isValidStakeAmountAtom } from 'views/staking/atoms'
import StakeModal from './StakeModal'

const StakeButton = () => {
  const [isOpen, setOpen] = useState(false)
  const isValid = useAtomValue(isValidStakeAmountAtom)
  const rTokenAddress = useAtomValue(selectedRTokenAtom)

  const handleOpen = useCallback(() => {
    setOpen(true)

    if (rTokenAddress) {
      mixpanel.track('Clicked Stake RSR', {
        RToken: rTokenAddress.toLowerCase(),
      })
    }
  }, [setOpen, rTokenAddress])
  const handleClose = useCallback(() => setOpen(false), [setOpen])

  return (
    <>
      <TransactionButtonContainer>
        <Button fullWidth disabled={!isValid} onClick={handleOpen}>
          <Trans>Stake RSR</Trans>
        </Button>
      </TransactionButtonContainer>
      {isOpen && <StakeModal onClose={handleClose} />}
    </>
  )
}

export default StakeButton
