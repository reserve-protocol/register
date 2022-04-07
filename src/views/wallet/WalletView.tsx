import { Box, Text } from 'theme-ui'
import { Container } from 'components'
import WalletConnection from 'components/wallets/WalletConnection'
import WalletList from 'components/wallets/WalletList'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { selectedAccountAtom, walletsAtom } from 'state/atoms'
import { shortenAddress } from 'utils'
import AddWallet from './components/AddWallet'

const WalletView = () => {
  const [wallets, setWallets] = useAtom(walletsAtom)
  const setCurrentAccount = useUpdateAtom(selectedAccountAtom)

  const handleAdd = (address: string, alias: string) => {
    setWallets({
      ...wallets,
      [address]: { address, alias },
    })
  }

  const handleConnect = (address: string) => {
    if (!wallets[address]) {
      handleAdd(address, shortenAddress(address))
    }
    setCurrentAccount(address)
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
