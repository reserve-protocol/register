import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { SearchInput } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import { shortenAddress } from '@/utils'
import { ChainId } from '@/utils/chains'
import { RESERVE_API } from '@/utils/constants'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useQuery } from '@tanstack/react-query'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowUpRightIcon, PlusIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList as List } from 'react-window'

const selectedTokensAtom = atom<Token[]>([])
const searchTokenAtom = atom<string>('')

export const TokenDrawerTrigger = ({ className }: { className?: string }) => {
  return (
    <DrawerTrigger asChild>
      <Button
        variant="none"
        className={cn(
          'flex gap-2 text-primary pl-3 pr-4 rounded-xl hover:bg-primary/10 group',
          className
        )}
      >
        <div className="flex items-center justify-center h-8 w-8 bg-primary/10 rounded-full group-hover:bg-transparent transition-colors">
          <PlusIcon size={16} />
        </div>
        Add new token
      </Button>
    </DrawerTrigger>
  )
}

const SearchToken = () => {
  const [search, setSearch] = useAtom(searchTokenAtom)
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    [setSearch]
  )

  return (
    <SearchInput
      className="mx-2"
      placeholder="Search by token name or address"
      value={search}
      onChange={handleSearch}
    />
  )
}

interface TokenListItemProps extends Token {
  showSelected?: boolean
}

const TokenListItem = ({
  address,
  name,
  symbol,
  decimals,
  logoURI,
}: TokenListItemProps) => {
  const chainId = useAtomValue(chainIdAtom)
  const [selectedTokens, setSelectedTokens] = useAtom(selectedTokensAtom)
  const checked = selectedTokens.some((t) => t.address === address)

  const onCheckedChange = useCallback(
    (checked: boolean) => {
      setSelectedTokens((prev) => [
        ...prev.filter((t) => t.address !== address),
        ...(checked ? [{ address, name, symbol, decimals, logoURI }] : []),
      ])
    },
    [address, name, symbol, decimals, setSelectedTokens]
  )

  return (
    <label
      htmlFor={address}
      role="div"
      className="w-full rounded-xl flex items-center gap-2 justify-between px-4 py-3 bg-muted cursor-pointer hover:bg-muted/80 transition-colors"
    >
      <div className="flex items-center gap-2">
        <TokenLogo src={logoURI?.replace('thumb', 'small')} size="xl" />
        <div className="flex flex-col">
          <div className="text-base font-bold">{name}</div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{symbol}</span>
            <span>•</span>
            <span>{shortenAddress(address)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-[12px]">
        <a
          className="bg-muted-foreground/10 rounded-full p-1 hover:bg-muted-foreground/20 transition-colors"
          role="button"
          href={getExplorerLink(address, chainId, ExplorerDataType.TOKEN)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ArrowUpRightIcon size={24} strokeWidth={1.5} />
        </a>
        <div className="border-l-2 border-dashed border-muted-foreground h-[20px]" />
        <Checkbox
          checked={checked}
          id={address}
          onCheckedChange={onCheckedChange}
        />
      </div>
    </label>
  )
}

const TokenSelectorHeader = () => {
  const selectedTokens = useAtomValue(selectedTokensAtom)
  return (
    <DrawerTitle className="flex gap-2 mt-2 px-2 mb-2">
      <TabsList className="h-9">
        <TabsTrigger value="all" className="w-max h-7">
          All
        </TabsTrigger>
        <TabsTrigger value="selected" className="w-max h-7">
          Selected ({selectedTokens.length})
        </TabsTrigger>
      </TabsList>
    </DrawerTitle>
  )
}

const LoadingSkeletons = () => (
  <>
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="h-[68px]" />
    ))}
  </>
)

interface TokenListProps {
  showSelected?: boolean
}

const TokenList = ({ showSelected = false }: TokenListProps) => {
  const search = useAtomValue(searchTokenAtom)
  const chainId = useAtomValue(chainIdAtom)
  const {
    data: tokenList = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['zapper-tokens', chainId],
    queryFn: async () => {
      try {
        const response = await fetch(
          RESERVE_API + `zapper/tokens?chainId=${chainId}`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch token list')
        }
        const data = await response.json()

        return data as Token[]
      } catch (error) {
        console.error('Error fetching token list:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  })

  const filteredTokens = useMemo(() => {
    if (!tokenList.length) return []

    const searchLower = search.trim().toLowerCase()
    if (!searchLower) return tokenList

    return tokenList
      .filter((token) => {
        const { name, symbol, address } = token
        return (
          name.toLowerCase().includes(searchLower) ||
          symbol.toLowerCase().includes(searchLower) ||
          address.toLowerCase() === searchLower // Exact match for addresses
        )
      })
      .sort((a, b) => a.name.length - b.name.length)
  }, [tokenList, search])

  const renderRow = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const token = filteredTokens[index]
      if (!token) return null

      return (
        <div style={style} className="px-2">
          <TokenListItem
            key={token.address}
            showSelected={showSelected}
            {...token}
          />
        </div>
      )
    },
    [filteredTokens, showSelected]
  )

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
        <p>Failed to load tokens</p>
        <p className="text-sm">Please try again later</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-1">
      {isLoading ? (
        <LoadingSkeletons />
      ) : filteredTokens.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No tokens found
        </div>
      ) : (
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              itemCount={filteredTokens.length}
              itemSize={72}
              width={width}
              className="hidden-scrollbar"
              overscanCount={20}
            >
              {renderRow}
            </List>
          )}
        </AutoSizer>
      )}
    </div>
  )
}

const SelectedTokenList = () => {
  const selectedTokens = useAtomValue(selectedTokensAtom)
  return (
    <div className="flex flex-col h-full px-2 gap-1">
      {selectedTokens.map((token) => (
        <TokenListItem key={token.address} {...token} />
      ))}
    </div>
  )
}

const SubmitSelectedTokens = ({
  onSubmit,
}: {
  onSubmit: (tokens: Token[]) => void
}) => {
  const selectedTokens = useAtomValue(selectedTokensAtom)
  const disabled = selectedTokens.length === 0

  const handleSubmit = useCallback(() => {
    onSubmit(selectedTokens)
  }, [selectedTokens, onSubmit])

  return (
    <DrawerTrigger asChild disabled={disabled}>
      <Button
        className={cn(
          'rounded-xl w-full py-7 text-base',
          disabled ? 'bg-muted-foreground' : ''
        )}
        disabled={disabled}
        onClick={handleSubmit}
      >
        {disabled
          ? 'Select tokens'
          : `Add ${selectedTokens.length} token${selectedTokens.length > 1 ? 's' : ''}`}
      </Button>
    </DrawerTrigger>
  )
}

const TokenSelector = ({
  onAdd,
  onClose,
  selectedTokens = [],
  children, // Drawer trigger
}: {
  onAdd: (tokens: Token[]) => void
  onClose?: () => void
  children: React.ReactNode
  selectedTokens: Token[]
}) => {
  const setSearch = useSetAtom(searchTokenAtom)
  const setSelectedTokens = useSetAtom(selectedTokensAtom)

  useEffect(() => {
    setSelectedTokens(selectedTokens)
  }, [selectedTokens, setSelectedTokens])

  const handleClose = useCallback(() => {
    setSelectedTokens([])
    setSearch('')
    onClose?.()
  }, [setSelectedTokens, setSearch, onClose])

  return (
    <Drawer onClose={handleClose}>
      {children}

      <DrawerContent>
        <Tabs
          defaultValue="all"
          className="flex flex-col flex-grow overflow-hidden relative"
        >
          <TokenSelectorHeader />
          <SearchToken />
          <TabsContent value="all" className="flex-grow overflow-auto">
            <TokenList />
          </TabsContent>
          <TabsContent value="selected" className="overflow-auto">
            <SelectedTokenList />
          </TabsContent>
        </Tabs>
        <DrawerFooter>
          <SubmitSelectedTokens onSubmit={onAdd} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default TokenSelector
