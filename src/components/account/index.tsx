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
import { useEnsName } from '@/hooks/use-ens-name'
import { useWalletModal } from '@/hooks/use-wallet-modal'
import { VoteLockSidebar } from '@/components/vote-lock'
import { Trans } from '@lingui/react/macro'
import ChainLogo from 'components/icons/ChainLogo'
import { useAtomValue } from 'jotai'
import { AlertCircle } from 'lucide-react'
import { ReactNode } from 'react'
import { chainIdAtom, selectedRTokenAtom } from 'state/atoms'
import { cn } from '@/lib/utils'
import { useAccount } from 'wagmi'

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
  const { address, chainId: walletChainId, isReconnecting } = useAccount()
  const displayName = useEnsName(address)
  const { openConnectModal, openAccountModal } = useWalletModal()

  const connected = !!address && !!walletChainId
  const invalidChain = isTokenSelected && connected && walletChainId !== chainId

  // WHY: hide the first paint while wagmi restores a persisted session, so a
  // reload does not flash "Connect" before the wallet chip.
  const hiddenWhileReconnecting = cn(
    isReconnecting && 'opacity-0 pointer-events-none select-none'
  )

  if (!connected) {
    return (
      <div className={hiddenWhileReconnecting} aria-hidden={isReconnecting}>
        <Button
          data-testid="header-connect-btn"
          variant="accent"
          onClick={() => handleConnect(openConnectModal)}
          className="h-9 px-4 py-1 rounded-full font-medium dark:border border-primary/50"
        >
          <span className="block text-sm">
            <Trans>Connect</Trans>
          </span>
        </Button>
      </div>
    )
  }

  return (
    <div className={hiddenWhileReconnecting} aria-hidden={isReconnecting}>
      <ErrorWrapper
        isValid={!invalidChain}
        chainId={walletChainId}
        currentChain={chainId}
      >
        <div
          data-testid="header-wallet"
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
                <ChainLogo chain={walletChainId} className="h-3.5 w-3.5" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 fill-destructive text-white" />
              )}
              <span className="text-sm font-normal">{displayName}</span>
            </div>
          </div>
          <div className="hidden h-9 items-center gap-1.5 rounded-full border border-border px-4 whitespace-nowrap lg:flex">
            {!invalidChain ? (
              <ChainLogo chain={walletChainId} className="w-[14px] h-[14px]" />
            ) : (
              <AlertCircle className="w-4 h-4 fill-destructive text-white" />
            )}
            <span className="text-sm font-normal">{displayName}</span>
          </div>
        </div>
      </ErrorWrapper>
      <VoteLockSidebar />
    </div>
  )
}

export default Account
