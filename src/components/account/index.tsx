import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import MenuIcon from 'components/icons/MenuIcon'
import WalletIcon from 'components/icons/WalletIcon'
import { MouseoverTooltipContent } from 'components/tooltip'
import { txSidebarToggleAtom } from 'components/transactions/manager/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode } from 'react'
import { AlertCircle, Power } from 'react-feather'
import { Box, Card, Flex, Spinner, Text } from 'theme-ui'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { isTransactionRunning } from 'state/chain/atoms/transactionAtoms'
import { chainIdAtom } from 'state/atoms'

const Container = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 38px;
  padding: 8px;
  cursor: pointer;
`

const ErrorWrapper = ({
  chainId,
  children,
  isValid,
  currentChain,
}: {
  isValid: boolean
  chainId?: number
  children: ReactNode
  currentChain: number
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
              The configured network "{currentChain}" is different from the
              wallet selected network "{chainId}"". Change your network in the
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
  const setVisible = useSetAtom(txSidebarToggleAtom)
  const isProcessing = useAtomValue(isTransactionRunning)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain
        const invalidChain = connected && chain.id !== chainId

        return (
          <Box
            {...(!ready && {
              'aria-hidden': true,
              sx: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <SmallButton
                    variant="accentAction"
                    onClick={openConnectModal}
                  >
                    <Text sx={{ display: ['none', 'initial'] }}>
                      <Trans>Connect wallet</Trans>
                    </Text>
                    <Text sx={{ display: ['inline', 'none'] }}>
                      <Trans>Connect</Trans>
                    </Text>
                  </SmallButton>
                )
              }

              return (
                <ErrorWrapper
                  isValid={!invalidChain}
                  chainId={chain.id}
                  currentChain={chainId}
                >
                  <Container onClick={() => setVisible(true)}>
                    {!invalidChain ? (
                      <WalletIcon />
                    ) : (
                      <AlertCircle fill="#FF0000" color="#fff" />
                    )}
                    <Text
                      sx={{ display: ['none', 'inherit', 'inherit'] }}
                      ml={2}
                    >
                      {account.displayName}
                    </Text>
                    {isProcessing && <Spinner size={20} marginLeft={10} />}
                    <MenuIcon style={{ marginLeft: 10 }} />
                  </Container>
                </ErrorWrapper>
              )
            })()}
          </Box>
        )
      }}
    </ConnectButton.Custom>
  )
}

export default Account
