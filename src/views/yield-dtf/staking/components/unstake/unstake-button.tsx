import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useCallback, useState } from 'react'
import { rTokenTradingAvailableAtom, selectedRTokenAtom } from 'state/atoms'
import UnstakeModal from './unstake-modal'
import { isValidUnstakeAmountAtom } from './atoms'

const UnstakeButton = () => {
  const [isOpen, setOpen] = useState(false)
  const isValid = useAtomValue(isValidUnstakeAmountAtom)
  const isAvailable = useAtomValue(rTokenTradingAvailableAtom)
  const rTokenAddress = useAtomValue(selectedRTokenAtom)

  const handleOpen = useCallback(() => {
    setOpen(true)

    if (rTokenAddress) {
      mixpanel.track('Clicked Unstake RSR', {
        RToken: rTokenAddress.toLowerCase(),
      })
    }
  }, [setOpen, rTokenAddress])
  const handleClose = useCallback(() => setOpen(false), [setOpen])

  return (
    <>
      <div className="mt-4">
        <Button
          className="w-full"
          disabled={!isValid && isAvailable}
          onClick={handleOpen}
        >
          <Trans>Unstake RSR</Trans>
        </Button>
      </div>
      {isOpen && <UnstakeModal onClose={handleClose} />}
    </>
  )
}

export default UnstakeButton
