import { Trans } from '@lingui/macro'
import { Input } from 'components'
import { SmallButton } from '@/components/old/button'
import { useState } from 'react'
import { Box, Text } from 'theme-ui'
import { isAddress } from 'utils'

const EditDelegate = ({
  onSave,
  onDismiss,
  current,
}: {
  onSave(value: string): void
  onDismiss(): void
  current: string
}) => {
  const [address, setAddress] = useState(current)
  const isValid = !!isAddress(address)

  return (
    <Box>
      <Box variant="layout.verticalAlign">
        <Text variant="legend">
          <Trans>Delegate voting power</Trans>
        </Text>
        <SmallButton
          disabled={!isValid}
          onClick={() => onSave(address)}
          ml="auto"
        >
          <Trans>Save</Trans>
        </SmallButton>
        <SmallButton onClick={() => onDismiss()} variant="muted" ml={2}>
          <Trans>Cancel</Trans>
        </SmallButton>
      </Box>
      <Input
        mt="2"
        mb={3}
        autoFocus
        value={address}
        placeholder="Input address"
        onChange={setAddress}
      />
      {address && !isValid && (
        <Text
          variant="error"
          mt={-2}
          mb={3}
          ml={3}
          sx={{ fontSize: 1, display: 'block' }}
        >
          <Trans>Invalid address</Trans>
        </Text>
      )}
    </Box>
  )
}

export default EditDelegate
