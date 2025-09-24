import ChainLogo from '@/components/icons/ChainLogo'
import { Button } from '@/components/ui/button'
import Copy from '@/components/ui/copy'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useIsLargeDesktop, useIsMobile } from '@/hooks/use-media-query'
import { chainIdAtom } from '@/state/atoms'
import { iTokenAddressAtom } from '@/state/dtf/atoms'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

const IndexTokenAddress = () => {
  const chainId = useAtomValue(chainIdAtom)
  const address = useAtomValue(iTokenAddressAtom)
  const isMobile = useIsMobile()

  if (!address) {
    return null
  }

  if (!isMobile) {
    return (
      <div className="text-sm sm:text-base flex items-center gap-1.5">
        <ChainLogo chain={chainId} />
        <span>{shortenAddress(address)}</span>
        <div className="flex items-center justify-center bg-muted dark:bg-white/5 rounded-full w-5 h-5 sm:w-6 sm:h-6">
          <Copy value={address} />
        </div>
        <Link
          to={getExplorerLink(address, chainId, ExplorerDataType.TOKEN)}
          target="_blank"
          className="p-1 bg-muted dark:bg-white/5 rounded-full"
        >
          <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </Link>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-2 h-8 text-sm sm:text-base py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/90 hover:text-white border border-white/10 data-[state=open]:bg-white/10 data-[state=open]:text-white focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ring-0"
        >
          <ChainLogo chain={chainId} />
          <span className="text-sm font-light">{shortenAddress(address)}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="bg-neutral-900 text-white border-white/10"
      >
        <DropdownMenuItem
          key="copy"
          onClick={() => {
            navigator.clipboard.writeText(address)
            toast.success('Address copied to clipboard')
          }}
          className="flex items-center gap-2 text-white/90 focus:bg-white/10 focus:text-white"
        >
          Copy address
        </DropdownMenuItem>
        <DropdownMenuItem
          key="explorer"
          onClick={() =>
            window.open(
              getExplorerLink(address, chainId, ExplorerDataType.TOKEN),
              '_blank'
            )
          }
          className="flex items-center gap-1.5 text-white/90 focus:bg-white/10 focus:text-white"
        >
          View on explorer
          <ArrowUpRight className="h-4 w-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default IndexTokenAddress
