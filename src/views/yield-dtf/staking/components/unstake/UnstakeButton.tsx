import { Trans } from '@lingui/macro'
import { Button } from 'components'
import { TransactionButtonContainer } from '@/components/old/button/TransactionButton'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useCallback, useState } from 'react'
import { rTokenTradingAvailableAtom, selectedRTokenAtom } from 'state/atoms'
import UnstakeModal from './UnstakeModal'
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
      <TransactionButtonContainer>
        <Button
          fullWidth
          disabled={!isValid && isAvailable}
          onClick={handleOpen}
        >
          <Trans>Unstake RSR</Trans>
        </Button>
      </TransactionButtonContainer>
      {isOpen && <UnstakeModal onClose={handleClose} />}
    </>
  )
}

export default UnstakeButton
