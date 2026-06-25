import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { VoteLockSidebar } from '@/components/vote-lock'
import { Trans } from '@lingui/react/macro'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useDisconnect } from 'wagmi'
import ChainLogo from 'components/icons/ChainLogo'
import { useAtomValue } from 'jotai'
import { AlertCircle } from 'lucide-react'
import { ReactNode } from 'react'
import { chainIdAtom, selectedRTokenAtom } from 'state/atoms'
import { cn } from '@/lib/utils'

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
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="p-0 border-0 bg-transparent">
        <Card className="w-80 p-4 border border-border">
          <span className="text-legend">
            <Trans>Network</Trans>
          </span>
          <div className="flex items-center my-2">
            <AlertCircle size={18} className="text-destructive" />
            <span className="ml-2">
              <Trans>Chain: {chainId}</Trans>
            </span>
            <span className="ml-auto font-medium">
              <Trans>Unsupported</Trans>
            </span>
          </div>
          <span className="text-legend text-sm">
            <Trans>
              The configured network "{currentChain}" is different from the
              wallet selected network "{chainId}"". Change your network in the
              connected wallet.
            </Trans>
          </span>
        </Card>
      </TooltipContent>
    </Tooltip>
  )

/**
 * Account
 *
 * Handles wallet interaction
 */
const Account = ({
  connectLabel,
  connectClassName,
}: {
  connectLabel?: ReactNode
  connectClassName?: string
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const isTokenSelected = !!useAtomValue(selectedRTokenAtom)
  const { disconnectAsync } = useDisconnect()

  // Tear down any lingering connector state before opening the modal. Without
  // this, a fresh Safe-over-WalletConnect connect can hang in "connecting" and
  // never resolve, leaving the app showing disconnected until a manual refresh
  // (the Gnosis-required flow already does this and connects reliably). A no-op
  // for the common disconnected case, so other wallets are unaffected.
  const handleConnect = async (openConnectModal: () => void) => {
    try {
      await disconnectAsync()
    } catch {
      // ignore — nothing to disconnect
    }
    openConnectModal()
  }

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain
        const invalidChain =
          isTokenSelected && connected && chain.id !== chainId

        return (
          <div
            className={cn(
              !ready && 'opacity-0 pointer-events-none select-none'
            )}
            aria-hidden={!ready}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    variant="accent"
                    onClick={() => handleConnect(openConnectModal)}
                    className={cn(
                      'h-9 px-4 py-1 rounded-full font-medium dark:border border-primary/50',
                      connectClassName
                    )}
                  >
                    <span className="block text-sm">
                      {connectLabel ?? <Trans>Connect</Trans>}
                    </span>
                  </Button>
                )
              }

              return (
                <>
                  <ErrorWrapper
                    isValid={!invalidChain}
                    chainId={chain.id}
                    currentChain={chainId}
                  >
                    <div
                      className="flex items-center cursor-pointer text-base"
                      onClick={openAccountModal}
                    >
                      <div className="lg:hidden">
                        <div className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-border px-3">
                          {!invalidChain ? (
                            <ChainLogo
                              chain={chain.id}
                              className="h-3.5 w-3.5"
                            />
                          ) : (
                            <AlertCircle
                              fill="#FF0000"
                              color="#fff"
                              className="h-3.5 w-3.5"
                            />
                          )}
                          <span className="text-sm font-normal">
                            {account.displayName}
                          </span>
                        </div>
                      </div>
                      <div className="hidden h-9 items-center gap-1.5 rounded-full border border-border px-4 whitespace-nowrap lg:flex">
                        {!invalidChain ? (
                          <ChainLogo
                            chain={chain.id}
                            className="w-[14px] h-[14px]"
                          />
                        ) : (
                          <AlertCircle
                            fill="#FF0000"
                            color="#fff"
                            className="w-4 h-4"
                          />
                        )}
                        <span className="text-sm font-normal">
                          {account.displayName}
                        </span>
                      </div>
                    </div>
                  </ErrorWrapper>
                  <VoteLockSidebar />
                </>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

export default Account
