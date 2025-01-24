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
import { Token } from '@/types'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useQuery } from '@tanstack/react-query'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { ArrowUpRightIcon, PlusIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList as List } from 'react-window'
import {
  basketAtom,
  daoCreatedAtom,
  searchTokenAtom,
  selectedTokensAtom,
} from '../../atoms'

interface TokenButtonProps {
  variant: 'primary' | 'secondary'
}

const TokenButton = ({ variant }: TokenButtonProps) => {
  const isPrimary = variant === 'primary'
  return (
    <DrawerTrigger asChild>
      <Button
        variant={isPrimary ? 'outline-primary' : 'accent'}
        className={cn(
          'flex gap-2 text-base pl-3 pr-4 rounded-xl',
          isPrimary ? 'py-5' : 'py-7 mx-2 bg-muted/80'
        )}
      >
        <PlusIcon size={16} />
        Add token
      </Button>
    </DrawerTrigger>
  )
}

const OpenButton = () => (
  <div className="flex items-center justify-center h-80 border-t border-b border-border mb-2">
    <TokenButton variant="primary" />
  </div>
)

const OpenButtonSecondary = () => <TokenButton variant="secondary" />

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
        <TokenLogo src={logoURI} size="xl" />
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
          href={getExplorerLink(address, 1, ExplorerDataType.TOKEN)}
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
    {Array.from({ length: 10 }).map((_, i) => (
      <Skeleton key={i} className="min-h-[68px] mx-2 rounded-xl" />
    ))}
  </>
)

interface TokenListProps {
  showSelected?: boolean
}

const TokenList = ({ showSelected = false }: TokenListProps) => {
  const search = useAtomValue(searchTokenAtom)
  const {
    data: tokenList = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['coingecko-tokens'],
    queryFn: async () => {
      try {
        const response = await fetch(
          'https://tokens.coingecko.com/base/all.json'
        )
        if (!response.ok) {
          throw new Error('Failed to fetch token list')
        }
        const data = await response.json()
        return data.tokens as Token[]
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

    return tokenList.filter((token) => {
      const { name, symbol, address } = token
      return (
        name.toLowerCase().includes(searchLower) ||
        symbol.toLowerCase().includes(searchLower) ||
        address.toLowerCase() === searchLower // Exact match for addresses
      )
    })
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

const SubmitSelectedTokens = () => {
  const { setValue } = useFormContext()
  const selectedTokens = useAtomValue(selectedTokensAtom)
  const setBasket = useSetAtom(basketAtom)
  const disabled = selectedTokens.length === 0

  const onSubmit = useCallback(() => {
    setBasket((prev) => {
      const newBasket = [
        ...prev.filter(
          (t) => !selectedTokens.some((s) => s.address === t.address)
        ),
        ...selectedTokens,
      ]

      setValue(
        'tokensDistribution',
        newBasket.map((token) => ({
          address: token.address,
          percentage: 0,
        }))
      )

      return newBasket
    })
  }, [selectedTokens, setBasket, setValue])

  return (
    <DrawerTrigger asChild disabled={disabled}>
      <Button
        className={cn(
          'rounded-xl w-full py-7 text-base',
          disabled ? 'bg-muted-foreground' : ''
        )}
        disabled={disabled}
        onClick={onSubmit}
      >
        {disabled
          ? 'Select tokens'
          : `Add ${selectedTokens.length} token${selectedTokens.length > 1 ? 's' : ''}`}
      </Button>
    </DrawerTrigger>
  )
}

const TokenSelector = () => {
  const basket = useAtomValue(basketAtom)
  const setSelectedTokens = useSetAtom(selectedTokensAtom)
  const resetSelectedTokens = useResetAtom(selectedTokensAtom)
  const resetSearchToken = useResetAtom(searchTokenAtom)

  useEffect(() => {
    if (basket.length) {
      setSelectedTokens(basket)
    }
  }, [basket, setSelectedTokens])

  const handleClose = useCallback(() => {
    resetSelectedTokens()
    resetSearchToken()
  }, [resetSelectedTokens, resetSearchToken])

  return (
    <Drawer onClose={handleClose}>
      {!!basket.length ? <OpenButtonSecondary /> : <OpenButton />}

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
          <SubmitSelectedTokens />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default TokenSelector
