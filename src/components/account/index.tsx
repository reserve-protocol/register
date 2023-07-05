import styled from '@emotion/styled'
import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import MenuIcon from 'components/icons/MenuIcon'
import WalletIcon from 'components/icons/WalletIcon'
import { MouseoverTooltipContent } from 'components/tooltip'
import { txSidebarToggleAtom } from 'components/transactions/manager/atoms'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { ReactNode } from 'react'
import { AlertCircle, Power } from 'react-feather'
import { pendingTxAtom } from 'state/atoms'
import { Box, Card, Flex, Spinner, Text } from 'theme-ui'

import { ConnectButton } from '@rainbow-me/rainbowkit'

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
  const setVisible = useSetAtom(txSidebarToggleAtom)
  const isProcessing = useAtomValue(isProcessingAtom)

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain

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
                      <Trans>Connect</Trans>
                    </Text>
                    <Box sx={{ display: ['inline', 'none'] }}>
                      <Power size={12} />
                    </Box>
                  </SmallButton>
                )
              }

              return (
                <ErrorWrapper isValid={!chain.unsupported} chainId={chain.id}>
                  <Container onClick={() => setVisible(true)}>
                    {!chain.unsupported ? (
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

  //   <div style={{ display: 'flex', gap: 12 }}>
  //   <button
  //     onClick={openChainModal}
  //     style={{ display: 'flex', alignItems: 'center' }}
  //     type="button"
  //   >
  //     {chain.hasIcon && (
  //       <div
  //         style={{
  //           background: chain.iconBackground,
  //           width: 12,
  //           height: 12,
  //           borderRadius: 999,
  //           overflow: 'hidden',
  //           marginRight: 4,
  //         }}
  //       >
  //         {chain.iconUrl && (
  //           <img
  //             alt={chain.name ?? 'Chain icon'}
  //             src={chain.iconUrl}
  //             style={{ width: 12, height: 12 }}
  //           />
  //         )}
  //       </div>
  //     )}
  //     {chain.name}
  //   </button>

  //   <button onClick={openAccountModal} type="button">
  //     {account.displayName}
  //     {account.displayBalance
  //       ? ` (${account.displayBalance})`
  //       : ''}
  //   </button>
  // </div>

  // return (
  //   <ConnectButton.Custom>
  //     {!account ? (
  //       <SmallButton
  //         variant="accentAction"
  //         onClick={() => setWalletVisible(true)}
  //       >
  //         <Text sx={{ display: ['none', 'initial'] }}>
  //           <Trans>Connect</Trans>
  //         </Text>
  //         <Box sx={{ display: ['inline', 'none'] }}>
  //           <Power size={12} />
  //         </Box>
  //       </SmallButton>
  //     ) : (
  //       <ErrorWrapper isValid={!isInvalid} chainId={chainId}>
  //         <Container onClick={() => setVisible(true)}>
  //           {!isInvalid ? (
  //             <WalletIcon />
  //           ) : (
  //             <AlertCircle fill="#FF0000" color="#fff" />
  //           )}
  //           <Text sx={{ display: ['none', 'inherit', 'inherit'] }} ml={2}>
  //             {ENSName || shortenAddress(account)}
  //           </Text>
  //           {isProcessing && <Spinner size={20} marginLeft={10} />}
  //           <MenuIcon style={{ marginLeft: 10 }} />
  //         </Container>
  //       </ErrorWrapper>
  //     )}
  //     {isVisible && <TransactionSidebar />}
  //     {isWalletModalVisible && <WalletModal />}
  //   </ConnectButton.Custom>
  // )
}

export default Account
