import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { zappableTokens } from '@/views/rtoken/issuance/components/zapV2/constants'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowUpRightIcon, PlusIcon, XIcon } from 'lucide-react'
import { basketAtom, searchTokenAtom, selectedTokensAtom } from '../atoms'
import { Token } from '@/types'
import TokenLogo from '@/components/icons/TokenLogo'
import { shortenAddress } from '@/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { SearchInput } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useResetAtom } from 'jotai/utils'

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

const CloseButton = () => (
  <DrawerTrigger asChild className="w-max rounded-xl px-2 h-9">
    <Button variant="outline">
      <XIcon size={20} strokeWidth={1.5} />
    </Button>
  </DrawerTrigger>
)

const SearchToken = () => {
  const [search, setSearch] = useAtom(searchTokenAtom)
  return (
    <SearchInput
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
    <>
      <DrawerTitle className="flex gap-2 mb-2">
        <CloseButton />
        <TabsList className="h-9">
          <TabsTrigger value="all" className="w-max h-7">
            All
          </TabsTrigger>
          <TabsTrigger value="selected" className="w-max h-7">
            Selected ({selectedTokens.length})
          </TabsTrigger>
        </TabsList>
      </DrawerTitle>
      <SearchToken />
    </>
  )
}

const TokenList = ({ showSelected = false }: { showSelected?: boolean }) => {
  const rTokens = zappableTokens[1] // TODO: replace with real data
  const search = useAtomValue(searchTokenAtom)

  const filteredTokens = rTokens.filter(
    (token) =>
      token.name.toLowerCase().includes(search.toLowerCase()) ||
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.address.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-1">
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
  const selectedTokens = useAtomValue(selectedTokensAtom)
  const setBasket = useSetAtom(basketAtom)
  const disabled = selectedTokens.length === 0

  return (
    <DrawerTrigger asChild disabled={disabled}>
      <Button
        className={cn(
          'rounded-xl w-full py-7 text-base',
          disabled ? 'bg-muted-foreground' : ''
        )}
        disabled={disabled}
        onClick={() => {
          setBasket((prev) => [
            ...prev.filter(
              (t) => !selectedTokens.some((s) => s.address === t.address)
            ),
            ...selectedTokens,
          ])
        }}
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

      <DrawerContent className="fixed left-auto right-2 top-2 bottom-2 outline-none w-[500px] flex bg-transparent border-none mt-0">
        <div className="bg-card h-full w-full grow p-2 flex flex-col rounded-[16px] overflow-y-auto">
          <Tabs defaultValue="all">
            <TokenSelectorHeader />
            <TabsContent value="all">
              <TokenList />
            </TabsContent>
            <TabsContent value="selected">
              <TokenList showSelected={true} />
            </TabsContent>
          </Tabs>
          <DrawerFooter className="p-0 mt-2">
            <SubmitSelectedTokens />
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default TokenSelector
