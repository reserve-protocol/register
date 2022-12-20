import Portal from '@reach/portal'
import { useSetAtom } from 'jotai'
import { Box, Flex } from 'theme-ui'
import { txSidebarToggleAtom } from './atoms'
import TransactionHeader from './TransactionHeader'
import TransactionList from './TransactionList'

const Container = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
  const setSidebar = useSetAtom(txSidebarToggleAtom)

  return (
    <Portal>
      <Box
        onClick={() => setSidebar(false)}
        sx={(theme: any) => ({
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 100000,
          opacity: '50%',
          width: '100vw',
          height: '100%',
          backgroundColor: theme.colors.modalOverlay,
        })}
      />
      <Box
        sx={(theme: any) => ({
          flexDirection: 'column',
          zIndex: 100001,
          display: 'flex',
          position: 'absolute',
          maxWidth: ['100vw', '768px'],
          width: ['100vw', '100vw', '60vw'],
          backgroundColor: 'background',
          right: 0,
          borderLeft: `solid 2px ${theme.colors.darkBorder}`,
          boxShadow: '-32px 0px 64px rgba(0, 0, 0, 0.15)',
          top: 0,
          height: '100%',
        })}
      >
        {children}
      </Box>
    </Portal>
  )
}

const TransactionSidebar = () => {
  return (
    <Container>
      <TransactionHeader />
      <TransactionList />
    </Container>
  )
}

export default TransactionSidebar
