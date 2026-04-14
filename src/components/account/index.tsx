import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import Staking from '@/views/index-dtf/overview/components/staking'
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
                      {/* Small screens: wallet icon with chain logo overlay */}
                      <div className="lg:hidden relative">
                        <div className="p-2 border border-border rounded-xl">
                          <Wallet size={16} />
                        </div>
                        <div className="absolute -bottom-1 -right-1">
                          {!invalidChain ? (
                            <ChainLogo chain={chain.id} className="w-3 h-3" />
                          ) : (
                            <AlertCircle
                              fill="#FF0000"
                              color="#fff"
                              className="w-3 h-3"
                            />
                          )}
                        </div>
                      </div>
                      {/* Large screens: bordered pill with chain + address */}
                      <div className="hidden lg:flex items-center gap-2 px-3 py-2 border border-border rounded-4xl whitespace-nowrap">
                        {!invalidChain ? (
                          <ChainLogo chain={chain.id} className="w-4 h-4" />
                        ) : (
                          <AlertCircle
                            fill="#FF0000"
                            color="#fff"
                            className="w-4 h-4"
                          />
                        )}
                        <span>{account.displayName}</span>
                      </div>
                    </div>
                  </ErrorWrapper>
                  <Staking />
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
