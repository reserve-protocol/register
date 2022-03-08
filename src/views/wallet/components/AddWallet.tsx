import { BoxProps, Text, Box, Grid } from '@theme-ui/components'
import { Input, Button } from 'components'
import { useState } from 'react'
import { isAddress, shortenAddress } from 'utils'
import { ZERO_ADDRESS } from 'constants/addresses'

interface Props extends BoxProps {
  onAdd(address: string, alias: string): void
}

const AddWallet = ({ onAdd, ...props }: Props) => {
  const [address, setAddress] = useState('')
  const [alias, setAlias] = useState('')

  const isValid = () => isAddress(address) && alias

  const handleAddressChange = (value: string) => {
    const formattedAddress = isAddress(value.toLowerCase().trim())

    if (formattedAddress && formattedAddress !== ZERO_ADDRESS) {
      setAddress(formattedAddress)
      setAlias(shortenAddress(formattedAddress))
    } else {
      setAddress(value)
    }
  }

  const handleAdd = () => {
    onAdd(address, alias)
    setAddress('')
    setAlias('')
  }

  return (
    <Box {...props}>
      <Text>Add wallet</Text>
      <Grid columns={2}>
        <Input
          mt={2}
          value={address}
          onChange={handleAddressChange}
          placeholder="Address"
        />
        <Input mt={2} value={alias} onChange={setAlias} placeholder="Alias" />
      </Grid>
      <Button mt={3} onClick={handleAdd} disabled={!isValid()}>
        + Add
      </Button>
    </Box>
  )
}

export default AddWallet
