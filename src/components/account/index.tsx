import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  headerControlSurfaceClassName,
  type HeaderControlSurface,
} from '@/components/layout/header/components/header-control-button'
import { useConnectWithReset } from '@/hooks/use-connect-with-reset'
import { VoteLockSidebar } from '@/components/vote-lock'
import { Trans } from '@lingui/react/macro'
import { ConnectButton } from '@rainbow-me/rainbowkit'
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
  mobileSurface = 'default',
}: {
  mobileSurface?: HeaderControlSurface
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const isTokenSelected = !!useAtomValue(selectedRTokenAtom)
  const handleConnect = useConnectWithReset()

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
                    className="h-9 px-4 py-1 rounded-full font-medium dark:border border-primary/50"
                  >
                    <span className="block text-sm">
                      <Trans>Connect</Trans>
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
                        <div
                          className={cn(
                            'flex h-9 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-3 transition-colors dark:bg-transparent',
                            headerControlSurfaceClassName(mobileSurface)
                          )}
                        >
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
