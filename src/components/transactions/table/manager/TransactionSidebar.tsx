import TransactionHistory from 'components/transaction-history'
import { useUpdateAtom } from 'jotai/utils'
import { Box, Text, Flex } from 'theme-ui'
import { txSidebarToggleAtom } from './atoms'

const TransactionSidebar = () => {
  const setSidebar = useUpdateAtom(txSidebarToggleAtom)

  return (
    <>
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
          maxWidth: '768px',
          width: '60vw',
          backgroundColor: '#F3F7F8',
          right: 0,
          top: 0,
          height: '100vh',
        }}
      >
        <Flex sx={{ alignItems: 'center' }} mb={4}>
          <Text>Recent Transactions</Text>
          <Box mx="auto" />
          <Box sx={{ cursor: 'pointer' }} onClick={() => setSidebar(false)}>
            X
          </Box>
        </Flex>
        <TransactionHistory history={[]} />
      </Box>
    </>
  )
}

export default TransactionSidebar
