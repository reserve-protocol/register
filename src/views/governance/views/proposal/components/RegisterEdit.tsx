import { Trans } from '@lingui/macro'
import { Input } from 'components'
import { SmallButton } from 'components/button'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { rTokenAssetsAtom } from 'state/atoms'
import { Box, BoxProps, Text } from 'theme-ui'
import { isAddress } from 'utils'

const NewAssetAddress = ({
  onSave,
  addresses,
}: {
  onSave(value: string): void
  addresses: string[]
}) => {
  const [address, setAddress] = useState('')

  const isValid = !!isAddress(address)
  const isExisting =
    isValid &&
    addresses.findIndex((a) => a.toLowerCase() === address.toLowerCase()) !== -1

  return (
    <Box>
      <Input
        my={3}
        autoFocus
        value={address}
        placeholder="Input address"
        onChange={setAddress}
      />
      {((address && !isValid) || isExisting) && (
        <Text
          variant="error"
          mt={-2}
          mb={3}
          ml={3}
          sx={{ fontSize: 1, display: 'block' }}
        >
          {isExisting ? (
            <Trans>This asset is already (being) registered</Trans>
          ) : (
            <Trans>Invalid asset</Trans>
          )}
        </Text>
      )}
      <SmallButton
        disabled={!isValid || isExisting}
        onClick={() => {
          setAddress('')
          onSave(address)
        }}
        ml={3}
      >
        <Trans>Save</Trans>
      </SmallButton>
    </Box>
  )
}

interface RoleEditProps extends Omit<BoxProps, 'onChange'> {
  onChange(address: string): void
  addresses: string[]
}

const RegisterEdit = ({ onChange, addresses }: RoleEditProps) => {
  const handleAdd = (address: string) => {
    onChange(address)
  }

  return <NewAssetAddress onSave={handleAdd} addresses={addresses} />
}

export default RegisterEdit
