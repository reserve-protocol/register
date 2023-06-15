import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import Button from 'components/button'
import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import WalletIcon from 'components/icons/WalletIcon'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { ChevronDown, X } from 'react-feather'
import { chainIdAtom, isWalletModalVisibleAtom } from 'state/atoms'
import { Box, Flex, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { txSidebarToggleAtom } from './atoms'

const TransactionHeader = () => {
  const setSidebar = useSetAtom(txSidebarToggleAtom)
  const setWalletModal = useSetAtom(isWalletModalVisibleAtom)
  const { ENSName, account } = useWeb3React()
  const chainId = useAtomValue(chainIdAtom)

  const handleChangeWallet = useCallback(() => {
    setSidebar(false)
    setWalletModal(true)
  }, [setSidebar, setWalletModal])

  return (
    <Flex
      sx={{
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'border',
        height: '56px',
        flexShrink: 0,
      }}
      px={[3, 5]}
    >
      <Text variant="sectionTitle" sx={{ fontSize: 3 }} mr={1}>
        <Trans>Account</Trans>
      </Text>
      <CopyValue
        sx={{ display: ['none', 'flex'], cursor: 'pointer' }}
        value={account || ''}
      />
      <GoTo
        sx={{ display: ['none', 'flex'] }}
        href={getExplorerLink(account || '', chainId, ExplorerDataType.ADDRESS)}
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
  )
}

export default TransactionHeader
