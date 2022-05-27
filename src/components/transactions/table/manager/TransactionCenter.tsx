import { Box, Spinner, Text } from 'theme-ui'
import { Menu } from 'react-feather'
import { atom, useAtom, useAtomValue } from 'jotai'
import { txSidebarToggleAtom } from './atoms'
import TransactionSidebar from './TransactionSidebar'
import { pendingTxAtom } from 'state/atoms'

const isProcessingAtom = atom((get) => {
  const { pending, signing, mining } = get(pendingTxAtom)

  return !!pending.length || !!signing.length || !!mining.length
})

const TransactionCenter = () => {
  const [isVisible, setVisible] = useAtom(txSidebarToggleAtom)
  const isProcessing = useAtomValue(isProcessingAtom)

  return (
    <Box ml={4} sx={{ alignItems: 'center', display: 'flex' }}>
      {isProcessing && <Spinner size={20} marginRight={10} />}
      <Text sx={{ display: ['none', 'inherit', 'inherit'] }} mr={3}>
        Transactions
      </Text>
      <Menu
        style={{ cursor: 'pointer' }}
        onClick={() => setVisible(!isVisible)}
      />
      {isVisible && <TransactionSidebar />}
    </Box>
  )
}

export default TransactionCenter
