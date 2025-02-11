import Button from '@/components/old/button'
import { MouseoverTooltipContent } from '@/components/old/tooltip'
import PortfolioSidebar from '@/views/portfolio/sidebar'
import { Trans } from '@lingui/macro'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ChainLogo from 'components/icons/ChainLogo'
import { useAtomValue } from 'jotai'
import { AlertCircle, Menu, Power } from 'lucide-react'
import { ReactNode } from 'react'
import { chainIdAtom, selectedRTokenAtom } from 'state/atoms'
import { Box, Card, Flex, Text } from 'theme-ui'

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
                  <PortfolioSidebar>
                    <Box
                      variant="layout.verticalAlign"
                      sx={{
                        justifyContent: 'center',
                        height: '38px',
                        cursor: 'pointer',
                      }}
                      p="2"
                      // onClick={() => setVisible(true)}
                    >
                      {!invalidChain ? (
                        <ChainLogo chain={chain.id} />
                      ) : (
                        <AlertCircle fill="#FF0000" color="#fff" />
                      )}
                      <Text
                        sx={{ display: ['none', 'inherit', 'inherit'] }}
                        ml={2}
                      >
                        {account.displayName}
                      </Text>
                      <Menu className="ml-2" size={16} />
                    </Box>
                  </PortfolioSidebar>
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
