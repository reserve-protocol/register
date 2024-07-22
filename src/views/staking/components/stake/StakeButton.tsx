import { Trans } from '@lingui/macro'
import { Button } from 'components'
import { TransactionButtonContainer } from 'components/button/TransactionButton'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { useCallback, useState } from 'react'
import { selectedRTokenAtom } from 'state/atoms'
import { isRTokenMintOrStakeEnabled } from 'state/geolocation/atoms'
import DisabledByGeolocationMessage from 'state/geolocation/DisabledByGeolocationMessage'
import { isValidStakeAmountAtom } from './atoms'
import StakeModal from './StakeModal'

const StakeButton = () => {
  const [isOpen, setOpen] = useState(false)
  const isValid = useAtomValue(isValidStakeAmountAtom)
  const rTokenAddress = useAtomValue(selectedRTokenAtom)
  const isEnabled = useAtomValue(isRTokenMintOrStakeEnabled)

  const handleOpen = useCallback(() => {
    if (!isEnabled.value) {
      return
    }

    setOpen(true)

    if (rTokenAddress) {
      mixpanel.track('Clicked Stake RSR', {
        RToken: rTokenAddress.toLowerCase(),
      })
    }
  }, [setOpen, rTokenAddress, isEnabled.value])
  const handleClose = useCallback(() => setOpen(false), [setOpen])

  return (
    <>
      <TransactionButtonContainer>
        <Button
          fullWidth
          disabled={!isValid || !isEnabled.value}
          onClick={handleOpen}
        >
          <Trans>Stake RSR</Trans>
        </Button>
      </TransactionButtonContainer>
      <DisabledByGeolocationMessage mt={2} />
      {isOpen && <StakeModal onClose={handleClose} />}
    </>
  )
}

export default StakeButton
