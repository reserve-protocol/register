import { Trans } from '@lingui/macro'
import { Button } from 'components'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useCallback, useState } from 'react'
import { selectedRTokenAtom } from 'state/atoms'
import { isValidStakeAmountAtom } from './atoms'
import StakeModal from './stake-modal'

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
      <div className="mt-4">
        <Button fullWidth disabled={!isValid} onClick={handleOpen}>
          <Trans>Stake RSR</Trans>
        </Button>
      </div>
      {isOpen && <StakeModal onClose={handleClose} />}
    </>
  )
}

export default StakeButton
