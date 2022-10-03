import { Trans } from '@lingui/macro'
import Portal from '@reach/portal'
import { useWeb3React } from '@web3-react/core'
import Button from 'components/button'
import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import WalletIcon from 'components/icons/WalletIcon'
import { useUpdateAtom } from 'jotai/utils'
import { ChevronDown, X } from 'react-feather'
import { isWalletModalVisibleAtom } from 'state/atoms'
import { Box, Flex, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { txSidebarToggleAtom } from './atoms'
import TransactionList from './TransactionList'

const TransactionSidebar = () => {
  const setSidebar = useUpdateAtom(txSidebarToggleAtom)
  const setWalletModal = useUpdateAtom(isWalletModalVisibleAtom)
  const { ENSName, account } = useWeb3React()

  const handleChangeWallet = () => {
    setSidebar(false)
    setWalletModal(true)
  }

  return (
    <Portal>
      <Box
        onClick={() => setSidebar(false)}
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
      <Flex
        sx={{
          flexDirection: 'column',
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
        <Flex
          sx={{
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'darkBorder',
            height: '56px',
            flexShrink: 0,
          }}
          px={5}
          mb={5}
        >
          <Text variant="title" sx={{ fontSize: 2 }} mr={3}>
            <Trans>Your account</Trans>
          </Text>
          <CopyValue
            sx={{ display: ['none', 'flex'] }}
            mr={2}
            value={account || ''}
          />
          <GoTo
            sx={{ display: ['none', 'flex'] }}
            href={getExplorerLink(account || '', ExplorerDataType.ADDRESS)}
          />
          <Box
            ml="auto"
            variant="layout.verticalAlign"
            mr={4}
            sx={{ cursor: 'pointer' }}
            onClick={handleChangeWallet}
          >
            <WalletIcon />
            <Text ml={2} mr={2}>
              {ENSName || shortenAddress(account ?? '')}
            </Text>
            <ChevronDown size={18} />
          </Box>
          <Button variant="circle" onClick={() => setSidebar(false)}>
            <X />
          </Button>
        </Flex>
        <TransactionList />
      </Flex>
    </Portal>
  )
}

export default TransactionSidebar
