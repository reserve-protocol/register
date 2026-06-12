import useIndexDTFList from '@/hooks/useIndexDTFList'
import useTokenList from '@/hooks/useTokenList'
import { getFolioRoute, getTokenRoute } from '@/utils'
import { CHAIN_TAGS } from '@/utils/constants'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import type { MessageDescriptor } from '@lingui/core'
import { atom, useAtom } from 'jotai'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Link, useNavigate } from 'react-router-dom'
import ChainLogo from '../icons/ChainLogo'
import TokenLogo from '../token-logo'
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
        symbol:
          dtf.symbol.toLowerCase() === 'hyusd'
            ? `${dtf.symbol} (${CHAIN_TAGS[dtf.chain]})`
            : dtf.symbol,
        name: dtf.name,
        chain: dtf.chain,
        address: dtf.id,
        icon: dtf.logo,
        keywords: [dtf.id, dtf.symbol, dtf.name],
      })),
    } as Record<string, DTF[]>
  }, [indexDTFs, yieldDTFs])
}

const SECTION_TITLES: Record<string, MessageDescriptor> = {
  index: msg`Index DTFs`,
  yield: msg`Yield DTFs`,
}
const SECTIONS = ['index', 'yield']

export const searchMenuOpenAtom = atom(false)

export const SEARCH_SHORTCUT =
  typeof navigator !== 'undefined' && navigator.userAgent.includes('Windows')
    ? 'Ctrl+K'
    : '⌘K'

const CommandMenu = () => {
  const { t } = useLingui()
  const dtfs = useAllDTFs()
  const [open, setOpen] = useAtom(searchMenuOpenAtom)
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
      <button
        type="button"
        aria-label={t`Search`}
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center h-8 w-8 rounded-md cursor-pointer hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Search size={16} strokeWidth={1.5} />
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="text-legend absolute top-3 right-3">
          {SEARCH_SHORTCUT}
        </div>
        <CommandInput
          placeholder={t`Search for a DTF...`}
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
            <CommandEmpty>
              <Trans>No results found.</Trans>
            </CommandEmpty>
            {SECTIONS.map((section) => (
              <CommandGroup key={section} heading={t(SECTION_TITLES[section])}>
                {dtfs[section].map((dtf) => (
                  <Link
                    key={dtf.address}
                    to={
                      section === 'index'
                        ? getFolioRoute(dtf.address, dtf.chain)
                        : getTokenRoute(dtf.address, dtf.chain)
                    }
                    onClick={() => setOpen(false)}
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
