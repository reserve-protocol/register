import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import Staking from '@/views/index-dtf/overview/components/staking'
import PortfolioSidebar from '@/views/portfolio/sidebar'
import { Trans } from '@lingui/macro'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ChainLogo from 'components/icons/ChainLogo'
import { useAtomValue } from 'jotai'
import { AlertCircle, Wallet, Power } from 'lucide-react'
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
            <span className="ml-2">Chain: {chainId}</span>
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
                    onClick={openConnectModal}
                    className="px-3.5 py-1 rounded-full font-normal"
                  >
                    <span className="flex md:hidden items-center py-1">
                      <Power size={16} />
                    </span>
                    <span className="hidden md:block text-base">
                      <Trans>Connect</Trans>
                    </span>
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
                    <div className="flex items-center justify-center cursor-pointer text-base">
                      <div className="flex items-center relative">
                        <div className="flex items-center absolute lg:relative -bottom-1 -right-1 lg:bottom-0 lg:right-0">
                          {!invalidChain ? (
                            <ChainLogo
                              chain={chain.id}
                              className="w-3 h-3 lg:w-4 lg:h-4"
                            />
                          ) : (
                            <AlertCircle
                              fill="#FF0000"
                              color="#fff"
                              className="w-3 h-3 lg:w-4 lg:h-4"
                            />
                          )}
                        </div>

                        <span className="hidden lg:inline ml-2">
                          {account.displayName}
                        </span>

                        <div className="lg:ml-3 p-2 border border-border rounded-xl">
                          <Wallet size={16} />
                        </div>
                      </div>
                    </div>
                  </PortfolioSidebar>
                  <Staking />
                </ErrorWrapper>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

export default Account
