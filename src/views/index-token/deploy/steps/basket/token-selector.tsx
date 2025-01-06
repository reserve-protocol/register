import TokenLogo from '@/components/icons/TokenLogo'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Token } from '@/types'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { ArrowUpRightIcon, PlusIcon, XIcon } from 'lucide-react'
import {
  basketAtom,
  searchTokenAtom,
  selectedTokensAtom,
  tokenListAtom,
} from '../../atoms'
import { useFormContext } from 'react-hook-form'

const OpenButton = () => (
  <div className="flex items-center justify-center h-80 border-t border-b border-border mb-2">
    <DrawerTrigger asChild>
      <Button
        variant="outline-primary"
        className="flex gap-2 text-base pl-3 pr-4 py-5 rounded-xl"
      >
        <PlusIcon size={16} />
        Add collateral
      </Button>
    </DrawerTrigger>
  </div>
)

const OpenButtonSecondary = () => (
  <DrawerTrigger asChild>
    <Button
      variant="accent"
      className="flex gap-2 text-base pl-3 pr-4 py-7 mx-2 rounded-xl bg-muted/80"
    >
      <PlusIcon size={16} />
      Add collateral
    </Button>
  </DrawerTrigger>
)

const SearchToken = () => {
  const [search, setSearch] = useAtom(searchTokenAtom)
  return (
    <SearchInput
      className="mx-2"
      placeholder="Search by token name or address"
      value={search}
      onChange={(e) => {
        setSearch(e.target.value)
      }}
    />
  )
}

const TokenListItem = ({
  address,
  name,
  symbol,
  decimals,
  showSelected = false,
}: Token & { showSelected?: boolean }) => {
  const [selectedTokens, setSelectedTokens] = useAtom(selectedTokensAtom)
  const checked = selectedTokens.some((t) => t.address === address)
  const onCheckedChange = (checked: boolean) => {
    setSelectedTokens((prev) => [
      ...prev.filter((t) => t.address !== address),
      ...(checked ? [{ address, name, symbol, decimals }] : []),
    ])
  }

  if (showSelected && !checked) return null

  return (
    <label
      htmlFor={address}
      role="div"
      className="w-full rounded-xl flex items-center gap-2 justify-between px-4 py-3 bg-muted cursor-pointer"
    >
      <div className="flex gap-2">
        <TokenLogo symbol={symbol} width={32} />
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
          className="bg-muted-foreground/10 rounded-full p-1 hover:bg-muted-foreground/20"
          role="button"
          href={getExplorerLink(address, 1, ExplorerDataType.TOKEN)} // TODO: replace with real data
          target="_blank"
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

const TokenList = ({ showSelected = false }: { showSelected?: boolean }) => {
  const allTokens = useAtomValue(tokenListAtom)
  const search = useAtomValue(searchTokenAtom)

  const filteredTokens = allTokens.filter(
    (token) =>
      token.name.toLowerCase().includes(search.toLowerCase()) ||
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.address.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col px-2 gap-1 ">
      {filteredTokens.map((token) => (
        <TokenListItem
          key={token.address}
          showSelected={showSelected}
          {...token}
        />
      ))}
    </div>
  )
}

const SubmitSelectedTokens = () => {
  const { setValue } = useFormContext()
  const selectedTokens = useAtomValue(selectedTokensAtom)
  const setBasket = useSetAtom(basketAtom)
  const disabled = selectedTokens.length === 0

  const onSubmit = () => {
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
  }

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
  const resetSelectedTokens = useResetAtom(selectedTokensAtom)
  const resetSearchToken = useResetAtom(searchTokenAtom)

  return (
    <Drawer
      direction="right"
      onClose={() => {
        resetSelectedTokens()
        resetSearchToken()
      }}
    >
      {!!basket.length ? <OpenButtonSecondary /> : <OpenButton />}

      <DrawerContent>
        <Tabs
          defaultValue="all"
          className="flex flex-col flex-grow overflow-hidden relative"
        >
          <TokenSelectorHeader />
          <SearchToken />
          <TabsContent value="all" className="overflow-auto">
            <TokenList />
          </TabsContent>
          <TabsContent value="selected" className="overflow-auto">
            <TokenList showSelected={true} />
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
