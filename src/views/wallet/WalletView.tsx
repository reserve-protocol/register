import { Box, Text } from '@theme-ui/components'
import { Container } from 'components'
import WalletConnection from 'components/wallets/WalletConnection'
import WalletList from 'components/wallets/WalletList'
import { useDispatch } from 'react-redux'
import { addConnectedWallet, addWallet } from 'state/wallets/reducer'
import AddWallet from './components/AddWallet'

const WalletView = () => {
  const dispatch = useDispatch()

  const handleAdd = (address: string, alias: string) => {
    dispatch(addWallet({ address, alias }))
  }

  const handleConnect = (address: string) => {
    dispatch(addConnectedWallet(address))
  }

  return (
    <Container>
      <Text>Wallet connect</Text>
      <Box mt={2} mb={3} p={2} sx={{ border: '1px solid #ccc' }}>
        <WalletConnection onConnect={handleConnect} />
      </Box>
      <Text>Track any account</Text>
      <AddWallet
        mt={2}
        mb={3}
        sx={{ border: '1px solid #ccc' }}
        p={4}
        onAdd={handleAdd}
      />
      <Text>Accounts</Text>
      <Box mt={2} p={2}>
        <WalletList />
      </Box>
    </Container>
  )
}

export default WalletView
