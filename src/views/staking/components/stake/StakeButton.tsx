import { Trans } from '@lingui/macro'
import { Button } from 'components'
import { TransactionButtonContainer } from 'components/button/TransactionButton'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { useCallback, useState } from 'react'
import { selectedRTokenAtom } from 'state/atoms'
import StakeModal from './StakeModal'
import { isStakingEnabledAtom, isValidStakeAmountAtom } from './atoms'
import { Box, Text } from 'theme-ui'
import { AlertCircle } from 'react-feather'
import AlertIcon from 'components/icons/AlertIcon'

const StakeButton = () => {
  const [isOpen, setOpen] = useState(false)
  const isValid = useAtomValue(isValidStakeAmountAtom)
  const rTokenAddress = useAtomValue(selectedRTokenAtom)
  const isEnabled = useAtomValue(isStakingEnabledAtom)

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
      {!isEnabled.value && !isEnabled.loading && (
        <Box
          mt="2"
          variant="layout.verticalAlign"
          sx={{ justifyContent: 'center' }}
        >
          <AlertIcon />
          <Text ml="2" variant="warning">
            This feature is not available on your location.
          </Text>
        </Box>
      )}
      {isOpen && <StakeModal onClose={handleClose} />}
    </>
  )
}

export default StakeButton
