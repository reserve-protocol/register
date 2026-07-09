import ChainLogo from '@/components/icons/ChainLogo'
import StackedChainLogo from '@/components/icons/StackedChainLogo'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { iTokenAddressAtom } from '@/state/dtf/atoms'
import { isAddress, shortenAddress } from '@/utils'
import { BRIDGED_INDEX_DTFS } from '@/utils/constants'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, ChevronDown, Copy, ExternalLink } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { Trans, useLingui } from '@lingui/react/macro'

const openExplorer = (addr: string, chain: number) => {
  window.open(getExplorerLink(addr, chain, ExplorerDataType.TOKEN), '_blank')
}

const IndexTokenAddress = ({
  theme = 'dark',
  className,
  labelClassName,
  labelGroupClassName,
  stackedLogoClassName,
  logoClassName,
  chevronClassName,
}: {
  theme?: 'light' | 'dark'
  className?: string
  labelClassName?: string
  labelGroupClassName?: string
  stackedLogoClassName?: string
  logoClassName?: string
  chevronClassName?: string
}) => {
  const { t } = useLingui()
  const chainId = useAtomValue(chainIdAtom)
  const address = useAtomValue(iTokenAddressAtom)

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(isAddress(addr) || addr)
    toast.success(t`Address copied to clipboard`)
  }

  const bridgedAddresses = useMemo(
    () => (address ? BRIDGED_INDEX_DTFS[address.toLowerCase()] : null),
    [address]
  )

  if (!address) {
    return null
  }

  const isDark = theme === 'dark'

  const triggerClassName = cn(
    isDark
      ? 'flex items-center gap-2 px-2 h-8 text-sm sm:text-base py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/90 hover:text-white border border-white/10 data-[state=open]:bg-white/10 data-[state=open]:text-white focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ring-0'
      : 'flex items-center gap-2 px-2 h-8 text-sm sm:text-base py-1 rounded-full border border-border focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ring-0',
    className
  )

  const contentClassName = isDark
    ? 'bg-neutral-900 text-white border-white/10'
    : ''

  const menuItemClassName = isDark
    ? 'flex items-center gap-2 text-white/90 focus:bg-white/10 focus:text-white'
    : 'flex items-center gap-2'

  const iconButtonClassName = isDark
    ? 'p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors'
    : 'p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors'

  const getBridgeLabel = (addr: string) =>
    addr.toLowerCase() === address.toLowerCase() ? (
      <Trans>Native</Trans>
    ) : (
      <Trans>Bridged</Trans>
    )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={triggerClassName}>
          <span className={cn('flex items-center gap-2', labelGroupClassName)}>
            {bridgedAddresses ? (
              <StackedChainLogo
                chains={bridgedAddresses.map((b) => b.chain)}
                className={stackedLogoClassName}
                logoClassName={logoClassName}
              />
            ) : (
              <ChainLogo chain={chainId} className={logoClassName} />
            )}
            <span className={cn('text-sm font-light', labelClassName)}>
              {shortenAddress(address)}
            </span>
          </span>
          <ChevronDown className={cn('h-4 w-4', chevronClassName)} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={contentClassName}>
        {bridgedAddresses ? (
          bridgedAddresses.map(({ address: addr, chain }) => (
            <div
              key={chain}
              className={`flex items-center justify-between gap-4 px-2 py-1.5 ${isDark ? 'text-white/90' : ''}`}
            >
              <div className="flex items-center gap-2">
                <ChainLogo chain={chain} className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm">{shortenAddress(addr)}</span>
                  <span
                    className={cn(
                      'text-xs',
                      isDark ? 'text-white/50' : 'text-muted-foreground'
                    )}
                  >
                    {getBridgeLabel(addr)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => copyAddress(addr)}
                  className={iconButtonClassName}
                  title={t`Copy address`}
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => openExplorer(addr, chain)}
                  className={iconButtonClassName}
                  title={t`View on explorer`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <>
            <DropdownMenuItem
              onClick={() => copyAddress(address)}
              className={menuItemClassName}
            >
              <Trans>Copy address</Trans>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openExplorer(address, chainId)}
              className={`${menuItemClassName} gap-1.5`}
            >
              <Trans>View on explorer</Trans>
              <ArrowUpRight className="h-4 w-4" />
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default IndexTokenAddress
