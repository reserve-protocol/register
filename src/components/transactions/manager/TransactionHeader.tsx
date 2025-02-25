import { Trans } from '@lingui/macro'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Button from '@/components/old/button'
import WalletIcon from 'components/icons/WalletIcon'
import { useSetAtom } from 'jotai'
import { ChevronDown, X } from 'lucide-react'
import { Box, Flex, Text } from 'theme-ui'
import { txSidebarToggleAtom } from './atoms'

const TransactionHeader = () => {
  const setSidebar = useSetAtom(txSidebarToggleAtom)

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
      <ConnectButton.Custom>
        {({ account, openAccountModal }) => {
          return (
            <Box
              ml="auto"
              variant="layout.verticalAlign"
              mr={4}
              sx={{ cursor: 'pointer' }}
              onClick={openAccountModal}
            >
              <WalletIcon />
              <Text ml={2} mr={2}>
                {account?.displayName}
              </Text>
              <ChevronDown size={18} />
            </Box>
          )
        }}
      </ConnectButton.Custom>
      <Button variant="circle" onClick={() => setSidebar(false)}>
        <X />
      </Button>
    </Flex>
  )
}

export default TransactionHeader
