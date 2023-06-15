import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { SmallButton } from 'components/button'
import MenuIcon from 'components/icons/MenuIcon'
import WalletIcon from 'components/icons/WalletIcon'
import { MouseoverTooltipContent } from 'components/tooltip'
import { txSidebarToggleAtom } from 'components/transactions/manager/atoms'
import TransactionSidebar from 'components/transactions/manager/TransactionSidebar'
import WalletModal from 'components/wallets/WalletModal'
import { atom, useAtom, useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import { AlertCircle, Power } from 'react-feather'
import { isWalletModalVisibleAtom, pendingTxAtom } from 'state/atoms'
import { Box, Card, Flex, Spinner, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { CHAINS } from 'utils/chains'

const Container = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 38px;
  padding: 8px;
  cursor: pointer;
`

const isProcessingAtom = atom((get) => {
  const { pending, signing, mining } = get(pendingTxAtom)

  return !!pending.length || !!signing.length || !!mining.length
})

const ErrorWrapper = ({
  chainId,
  children,
  isValid,
}: {
  isValid: boolean
  chainId?: number
  children: ReactNode
}) =>
  isValid ? (
    <>{children}</>
  ) : (
    <MouseoverTooltipContent
      content={
        <Card sx={{ width: 320, border: '1px solid black' }}>
          <Text sx={{ fontWeight: 400 }} variant="legend">
            <Trans>Network</Trans>
          </Text>
          <Flex my={2} variant="layout.verticalAlign">
            <AlertCircle size={18} color="#FF0000" />
            <Text ml={2}>Chain: {chainId}</Text>
            <Text ml="auto" sx={{ fontWeight: 500 }}>
              <Trans>Unsupported</Trans>
            </Text>
          </Flex>
          <Text variant="legend" sx={{ fontSize: 1 }}>
            <Trans>
              We only support Ethereum Mainnet. Change your network in the
              connected wallet.
            </Trans>
          </Text>
        </Card>
      }
    >
      {children}
    </MouseoverTooltipContent>
  )

/**
 * Account
 *
 * Handles wallet interaction
 */
const Account = () => {
  const [isVisible, setVisible] = useAtom(txSidebarToggleAtom)
  const [isWalletModalVisible, setWalletVisible] = useAtom(
    isWalletModalVisibleAtom
  )
  const isProcessing = useAtomValue(isProcessingAtom)
  const { ENSName, account, chainId } = useWeb3React()
  const isInvalid = !CHAINS[chainId || 0]

  return (
    <>
      {!account ? (
        <SmallButton
          variant="accentAction"
          onClick={() => setWalletVisible(true)}
        >
          <Text sx={{ display: ['none', 'initial'] }}>
            <Trans>Connect</Trans>
          </Text>
          <Box sx={{ display: ['inline', 'none'] }}>
            <Power size={12} />
          </Box>
        </SmallButton>
      ) : (
        <ErrorWrapper isValid={!isInvalid} chainId={chainId}>
          <Container onClick={() => setVisible(true)}>
            {!isInvalid ? (
              <WalletIcon />
            ) : (
              <AlertCircle fill="#FF0000" color="#fff" />
            )}
            <Text sx={{ display: ['none', 'inherit', 'inherit'] }} ml={2}>
              {ENSName || shortenAddress(account)}
            </Text>
            {isProcessing && <Spinner size={20} marginLeft={10} />}
            <MenuIcon style={{ marginLeft: 10 }} />
          </Container>
        </ErrorWrapper>
      )}
      {isVisible && <TransactionSidebar />}
      {isWalletModalVisible && <WalletModal />}
    </>
  )
}

export default Account
