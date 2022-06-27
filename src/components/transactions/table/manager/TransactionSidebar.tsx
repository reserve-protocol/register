import Portal from '@reach/portal'
import Button from 'components/button'
import TransactionHistory from 'components/transaction-history'
import { atom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { X } from 'react-feather'
import { currentTxAtom } from 'state/atoms'
import { Box, Text, Flex } from 'theme-ui'
import { txSidebarToggleAtom } from './atoms'

const txByDate = atom((get) => {
  const txs = get(currentTxAtom)
  console.log('txs')
})

const TransactionList = () => {
  return <Box>tx list</Box>
}

const TransactionSidebar = () => {
  const setSidebar = useUpdateAtom(txSidebarToggleAtom)

  return (
    <Portal>
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 100000,
          opacity: '50%',
          width: '100vw',
          height: '100vh',
          backgroundColor: 'black',
        }}
      />
      <Box
        px={4}
        py={3}
        sx={{
          zIndex: 100001,
          position: 'absolute',
          maxWidth: ['100vw', '768px'],
          width: ['100vw', '100vw', '60vw'],
          backgroundColor: 'background',
          right: 0,
          top: 0,
          height: '100vh',
        }}
      >
        <Flex sx={{ alignItems: 'center' }} mb={4}>
          <Text variant="sectionTitle">Recent Transactions</Text>
          <Box mx="auto" />
          <Button variant="circle" onClick={() => setSidebar(false)}>
            <X />
          </Button>
        </Flex>
        <TransactionList />
      </Box>
    </Portal>
  )
}

export default TransactionSidebar
