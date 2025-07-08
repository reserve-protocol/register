import useIndexDTFList from '@/hooks/useIndexDTFList'
import useTokenList from '@/hooks/useTokenList'
import { getFolioRoute, getTokenRoute } from '@/utils'
import { CHAIN_TAGS } from '@/utils/constants'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Link, useNavigate } from 'react-router-dom'
import ChainLogo from '../icons/ChainLogo'
import TokenLogo from '../token-logo'
import { Button } from '../ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'

type DTF = {
  symbol: string
  name: string
  chain: number
  address: string
  icon: string
  keywords?: string[]
}

const useAllDTFs = () => {
  const { data: indexDTFs } = useIndexDTFList()
  const { list: yieldDTFs } = useTokenList()

  return useMemo(() => {
    if (!indexDTFs || !yieldDTFs) {
      return undefined
    }

    return {
      index: indexDTFs.map((dtf) => ({
        symbol: dtf.symbol,
        name: dtf.name,
        chain: dtf.chainId,
        address: dtf.address,
        icon: dtf.brand?.icon,
        keywords: [dtf.address, dtf.symbol, dtf.name],
      })),
      yield: yieldDTFs.map((dtf) => ({
        symbol: dtf.symbol,
        name: dtf.name,
        chain: dtf.chain,
        address: dtf.id,
        icon: dtf.logo,
        keywords: [dtf.id, dtf.symbol, dtf.name],
      })),
    } as Record<string, DTF[]>
  }, [indexDTFs, yieldDTFs])
}

const SECTION_TITLES: Record<string, string> = {
  index: 'Index DTFs',
  yield: 'Yield DTFs',
}
const SECTIONS = ['index', 'yield']

const CommandMenu = () => {
  const dtfs = useAllDTFs()
  const [open, setOpen] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Search size={16} strokeWidth={1.5} />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="text-legend absolute top-3 right-3">
          {navigator.userAgent.includes('Windows') ? 'Ctrl+K' : '⌘K'}
        </div>
        <CommandInput
          placeholder="Search for a DTF..."
          onInput={() => {
            setTimeout(() => {
              listRef.current?.scrollTo({ top: 0 })
            }, 0)
          }}
        />
        {!dtfs ? (
          <div className="flex flex-col gap-1 p-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <CommandList ref={listRef} className="h-[420px]">
            <CommandEmpty>No results found.</CommandEmpty>
            {SECTIONS.map((section) => (
              <CommandGroup key={section} heading={SECTION_TITLES[section]}>
                {dtfs[section].map((dtf) => (
                  <Link
                    to={
                      section === 'index'
                        ? getFolioRoute(dtf.address, dtf.chain)
                        : getTokenRoute(dtf.address, dtf.chain)
                    }
                    onClick={() => setOpen(false)}
                    key={dtf.address}
                  >
                    <CommandItem
                      keywords={dtf.keywords}
                      value={`${dtf.name} ${dtf.symbol}`}
                      className="gap-3 cursor-pointer"
                      onSelect={() => {
                        navigate(
                          section === 'index'
                            ? getFolioRoute(dtf.address, dtf.chain)
                            : getTokenRoute(dtf.address, dtf.chain)
                        )
                        setOpen(false)
                      }}
                    >
                      <div className="relative">
                        <TokenLogo src={dtf.icon} size="xl" />
                        <ChainLogo
                          chain={dtf.chain}
                          className="absolute -bottom-1 -right-1 w-4 h-2"
                        />
                      </div>
                      <div className="break-words  max-w-[420px]">
                        <h4 className="font-semibold ">{dtf.name}</h4>
                        <span className="text-legend">${dtf.symbol}</span>
                      </div>
                    </CommandItem>
                  </Link>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        )}
      </CommandDialog>
    </>
  )
}

export default CommandMenu
