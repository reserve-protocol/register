import ChainLogo from '@/components/icons/ChainLogo'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useIsMobile } from '@/hooks/use-media-query'
import { chainIdAtom } from '@/state/atoms'
import { iTokenAddressAtom } from '@/state/dtf/atoms'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 px-2 h-8 text-sm sm:text-base py-1 rounded-full border border-border rounded-fullfocus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ring-0"
          >
            <ChainLogo chain={chainId} />
            <span className="text-sm font-light">
              {shortenAddress(address)}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            key="copy"
            onClick={() => {
              navigator.clipboard.writeText(address)
              toast.success('Address copied to clipboard')
            }}
            className="flex items-center gap-2"
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
            className="flex items-center gap-1.5"
          >
            View on explorer
            <ArrowUpRight className="h-4 w-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
