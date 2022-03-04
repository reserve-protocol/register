import { Box, Text } from '@theme-ui/components'
import { Container } from 'components'
import WalletConnection from 'components/wallets/WalletConnection'
import WalletList from 'components/wallets/WalletList'
import { useDispatch } from 'react-redux'
import { addWallet } from 'state/wallets/reducer'
import AddWallet from './components/AddWallet'

const Home = () => {
  const dispatch = useDispatch()

  const handleAdd = (address: string, alias: string) => {
    dispatch(addWallet({ address, alias }))
  }

  return (
    <Container>
      <Text>Wallet connect</Text>
      <Box mt={2} mb={3} p={2} sx={{ border: '1px solid #ccc' }}>
        <WalletConnection />
      </Box>
      <Text>Track any wallet</Text>
      <AddWallet
        mt={2}
        mb={3}
        sx={{ border: '1px solid #ccc' }}
        p={4}
        onAdd={handleAdd}
      />
      <Text>Wallet list</Text>
      <Box mt={2} p={2}>
        <WalletList />
      </Box>
    </Container>
  )
}

export default Home
