import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import useIndexDTFList, { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { cn } from '@/lib/utils'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { getFolioRoute } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { Check } from 'lucide-react'
import { ReactNode, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const DTF_SECTIONS: string[] = [
  ROUTES.OVERVIEW,
  ROUTES.ISSUANCE,
  ROUTES.GOVERNANCE,
  ROUTES.AUCTIONS,
  ROUTES.SETTINGS,
]

// Keeps the user on the section they were browsing when they switch DTF
export const useCurrentDTFSection = () => {
  const { pathname } = useLocation()

  return useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const dtfIndex = segments.indexOf('index-dtf')
    const section = dtfIndex >= 0 ? segments[dtfIndex + 2] : undefined

    return section && DTF_SECTIONS.includes(section) ? section : ROUTES.OVERVIEW
  }, [pathname])
}

const isActiveDTF = (dtf: IndexDTFItem) => dtf.status === 'active'

const DTFOption = ({
  dtf,
  section,
  isCurrent,
  onSelect,
}: {
  dtf: IndexDTFItem
  section: string
  isCurrent: boolean
  onSelect: (dtf: IndexDTFItem, route: string) => void
}) => {
  // Auctions are unavailable on inactive DTFs, so land on overview instead
  const route =
    section === ROUTES.AUCTIONS && !isActiveDTF(dtf)
      ? ROUTES.OVERVIEW
      : section

  return (
    <CommandItem
      value={`${dtf.name} ${dtf.symbol} ${dtf.address}`}
      keywords={[dtf.address, dtf.symbol, dtf.name]}
      data-testid="dtf-switcher-option"
      data-address={dtf.address.toLowerCase()}
      data-chain={dtf.chainId}
      className="flex cursor-pointer items-center gap-2"
      onSelect={() =>
        onSelect(dtf, getFolioRoute(dtf.address, dtf.chainId, route))
      }
    >
      <div className="relative shrink-0">
        <TokenLogo
          src={dtf.brand?.icon}
          symbol={dtf.symbol}
          address={dtf.address}
          chain={dtf.chainId}
          size="lg"
        />
        <ChainLogo
          chain={dtf.chainId}
          className="absolute -bottom-1 -right-1 h-2 w-4"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">${dtf.symbol}</div>
        <div className="truncate text-xs text-muted-foreground">{dtf.name}</div>
      </div>
      {isCurrent && <Check className="h-4 w-4 shrink-0 text-primary" />}
    </CommandItem>
  )
}

const DTFSwitcher = ({
  children,
  align = 'start',
  className,
  onNavigate,
}: {
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  className?: string
  onNavigate?: () => void
}) => {
  const { t } = useLingui()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const currentDTF = useAtomValue(indexDTFAtom)
  const section = useCurrentDTFSection()
  const { data } = useIndexDTFList()
  const { trackClick } = useTrackIndexDTFClick(section, 'navigation')

  const dtfs = useMemo(() => {
    if (!data) return undefined

    return data
      .filter((dtf) => dtf.status !== 'unsupported')
      .sort((a, b) => {
        if (isActiveDTF(a) !== isActiveDTF(b)) return isActiveDTF(a) ? -1 : 1
        return (b.marketCap || 0) - (a.marketCap || 0)
      })
  }, [data])

  const onSelect = (dtf: IndexDTFItem, route: string) => {
    trackClick('switch_dtf', {
      target_ca: dtf.address,
      target_ticker: dtf.symbol,
      target_chain: dtf.chainId,
    })
    setOpen(false)
    onNavigate?.()
    navigate(route)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn('w-[320px] p-0', className)}
        data-testid="dtf-switcher-content"
      >
        <Command loop>
          <CommandInput
            placeholder={t`Switch DTF...`}
            data-testid="dtf-switcher-search"
          />
          {!dtfs ? (
            <div
              className="flex flex-col gap-2 p-2"
              data-testid="dtf-switcher-skeleton"
            >
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <CommandList className="max-h-[320px]">
              <CommandEmpty>
                <Trans>No DTFs found.</Trans>
              </CommandEmpty>
              <CommandGroup>
                {dtfs.map((dtf) => (
                  <DTFOption
                    key={`${dtf.chainId}-${dtf.address}`}
                    dtf={dtf}
                    section={section}
                    isCurrent={
                      !!currentDTF &&
                      currentDTF.id.toLowerCase() === dtf.address.toLowerCase()
                    }
                    onSelect={onSelect}
                  />
                ))}
              </CommandGroup>
            </CommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default DTFSwitcher
