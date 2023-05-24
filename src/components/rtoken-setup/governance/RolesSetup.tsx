import { Trans } from '@lingui/macro'
import { Input } from 'components'
import { SmallButton } from 'components/button'
import { useState } from 'react'
import { Box, BoxProps, Text } from 'theme-ui'
import { isAddress } from 'utils'

const NewRoleAddress = ({
  onSave,
  onDismiss,
  addresses,
}: {
  onSave(value: string): void
  onDismiss(): void
  addresses: string[]
}) => {
  const [address, setAddress] = useState('')
  const isValid = !!isAddress(address)
  const isExisting =
    isValid &&
    addresses.findIndex((a) => a.toLowerCase() === address.toLowerCase()) !== -1

  return (
    <Box>
      <Input my={3} value={address} onChange={setAddress} />
      {((address && !isValid) || isExisting) && (
        <Text
          variant="error"
          mt={-2}
          mb={3}
          ml={3}
          sx={{ fontSize: 1, display: 'block' }}
        >
          {isExisting ? (
            <Trans>This address already holds this role</Trans>
          ) : (
            <Trans>Invalid address</Trans>
          )}
        </Text>
      )}
      <SmallButton
        disabled={!isValid || isExisting}
        onClick={() => onSave(address)}
        ml={3}
      >
        <Trans>Save</Trans>
      </SmallButton>
      <SmallButton onClick={() => onDismiss()} variant="muted" ml={3}>
        <Trans>Dismiss</Trans>
      </SmallButton>
    </Box>
  )
}

interface RoleSetupProps extends Omit<BoxProps, 'onChange'> {
  title: string
  onChange(addresses: string[]): void
  addresses: string[]
}

const RolesSetup = ({
  title,
  onChange,
  addresses,
  ...props
}: RoleSetupProps) => {
  const [isCreating, setCreate] = useState(false)

  const handleAdd = (address: string) => {
    setCreate(false)
    onChange([...addresses, address])
  }

  const handleRemove = (index: number) => {
    onChange([...addresses.slice(0, index), ...addresses.slice(index + 1)])
  }

  return (
    <Box {...props}>
      <Text variant="title">{title}</Text>
      {!addresses.length && (
        <Text
          variant="legend"
          sx={{ fontStyle: 'italic', display: 'block' }}
          mt={3}
          ml={3}
        >
          <Trans>No holders for this role...</Trans>
        </Text>
      )}
      {addresses.map((addr, index) => (
        <Box
          variant="layout.verticalAlign"
          sx={{ flexWrap: 'wrap' }}
          key={addr}
          mt={3}
        >
          <Box mr={2} variant="layout.verticalAlign">
            <Box
              ml={1}
              mr={3}
              sx={{
                height: '4px',
                width: '4px',
                borderRadius: '100%',
                backgroundColor: 'text',
              }}
            />
            <Box>
              <Text sx={{ fontSize: 1, display: 'block' }} variant="legend">
                <Trans>Current holder</Trans>
              </Text>
              <Text sx={{ wordBreak: 'break-word' }}>{addr}</Text>
            </Box>
          </Box>

          <SmallButton
            ml="auto"
            variant="danger"
            sx={{ backgroundColor: 'inputBorder' }}
            onClick={() => handleRemove(index)}
          >
            <Trans>Remove</Trans>
          </SmallButton>
        </Box>
      ))}
      {isCreating ? (
        <NewRoleAddress
          onSave={handleAdd}
          onDismiss={() => setCreate(false)}
          addresses={addresses}
        />
      ) : (
        <SmallButton
          ml={3}
          mt={4}
          onClick={() => setCreate(true)}
          variant="muted"
        >
          Add new {title.substring(0, title.length - 1).toLowerCase()}
        </SmallButton>
      )}
    </Box>
  )
}

export default RolesSetup
