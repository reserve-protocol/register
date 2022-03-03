import { useState } from 'react'
import { Container, Input } from 'components'
import { useAppSelector } from 'state/hooks'
import { Box, Text, Grid, Button } from '@theme-ui/components'
import { useDispatch } from 'react-redux'
import { addWallet, removeWallet } from 'state/wallets/reducer'
import WalletConnection from 'components/wallets/WalletConnection'

const Home = () => {
  const dispatch = useDispatch()
  const [walletList, selectedWallet] = useAppSelector(({ wallets }) => [
    wallets.list,
    wallets.current && wallets.list[wallets.current],
  ])
  const [address, setAddress] = useState('')
  const [alias, setAlias] = useState('')

  const handleAdd = () => {
    dispatch(addWallet({ address, alias }))
    setAddress('')
    setAlias('')
  }

  const handleRemove = (index: number) => {
    dispatch(removeWallet(index))
  }

  return (
    <Container>
      <Box p={2} sx={{ border: '1px solid #ccc' }}>
        <Text>Wallet connect</Text>
        <WalletConnection />
      </Box>
      <Box>
        <Text>Accounts</Text>
        {walletList.map((wallet, index) => (
          <Box p={2} key={wallet.address}>
            <Text>{wallet.alias}</Text>
            <Text>{wallet.address}</Text>
            <Button ml={3} onClick={() => handleRemove(index)}>
              - Remove
            </Button>
          </Box>
        ))}
      </Box>
      <Box sx={{ border: '1px solid #ccc' }} p={4}>
        <Text>Add wallet</Text>
        <Grid columns={2}>
          <Input
            mt={2}
            value={address}
            onChange={setAddress}
            placeholder="Address"
          />
          <Input mt={2} value={alias} onChange={setAlias} placeholder="Alias" />
        </Grid>
        <Button mt={3} onClick={handleAdd} disabled={!alias || !address}>
          + Add
        </Button>
      </Box>
    </Container>
  )
}

export default Home
