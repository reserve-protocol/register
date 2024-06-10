import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import Button from 'components/button'
import MenuIcon from 'components/icons/MenuIcon'
import { MouseoverTooltipContent } from 'components/tooltip'
import { txSidebarToggleAtom } from 'components/transactions/manager/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode } from 'react'
import { AlertCircle, Power } from 'react-feather'
import { Box, Card, Flex, Spinner, Text } from 'theme-ui'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ChainLogo from 'components/icons/ChainLogo'
import { chainIdAtom, selectedRTokenAtom } from 'state/atoms'
import { isTransactionRunning } from 'state/chain/atoms/transactionAtoms'

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
  const isTokenSelected = !!useAtomValue(selectedRTokenAtom)

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain
        const invalidChain =
          isTokenSelected && connected && chain.id !== chainId

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
                  <Button
                    variant="accentAction"
                    onClick={openConnectModal}
                    px={2}
                    py={1}
                  >
                    <Box
                      sx={{ display: ['flex', 'none'] }}
                      variant="layout.verticalAlign"
                      py={1}
                    >
                      <Power size={16} />
                    </Box>
                    <Text sx={{ display: ['none', 'block'], fontSize: 1 }}>
                      <Trans>Connect</Trans>
                    </Text>
                  </Button>
                )
              }

              return (
                <ErrorWrapper
                  isValid={!invalidChain}
                  chainId={chain.id}
                  currentChain={chainId}
                >
                  <Container
                    onClick={() => setVisible(true)}
                    data-testid="account-navbar"
                  >
                    {!invalidChain ? (
                      <ChainLogo chain={chain.id} />
                    ) : (
                      <AlertCircle fill="#FF0000" color="#fff" />
                    )}
                    <Text
                      sx={{ display: ['none', 'inherit', 'inherit'] }}
                      ml={2}
                      data-testid="account-display-name"
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
