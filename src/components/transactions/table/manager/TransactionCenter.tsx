import { Box, Text } from 'theme-ui'
import { Menu } from 'react-feather'
import { useAtom } from 'jotai'
import { txSidebarToggleAtom } from './atoms'
import TransactionSidebar from './TransactionSidebar'

const TransactionCenter = () => {
  const [isVisible, setVisible] = useAtom(txSidebarToggleAtom)

  return (
    <Box ml={4} sx={{ alignItems: 'center', display: 'flex' }}>
      <Text mr={3}>Transactions</Text>
      <Menu
        style={{ cursor: 'pointer' }}
        onClick={() => setVisible(!isVisible)}
      />
      {isVisible && <TransactionSidebar />}
    </Box>
  )
}

export default TransactionCenter
