import { SearchInput } from '@/components/ui/input'
import MultiselectDropdown from '@/components/ui/multiselect-dropdown'
import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/stack-token-logo'
import { useAtom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  searchFilterAtom,
  chainsFilterAtom,
  dtfsFilterAtom,
  availableDtfsAtom,
  yieldDTFListAtom,
} from '../atoms'
import { CircleIcon } from 'lucide-react'
import YieldChainFilter from './yield-chain-filter'

const DtfFilterDropdown = () => {
  const [selectedDtfs, setSelectedDtfs] = useAtom(dtfsFilterAtom)
  const availableDtfs = useAtomValue(availableDtfsAtom)
  const yieldDTFList = useAtomValue(yieldDTFListAtom)

  const options = useMemo(() => {
    return availableDtfs.map((dtfSymbol) => {
      const dtfData = yieldDTFList?.find(dtf => dtf.symbol === dtfSymbol)
      return {
        value: dtfSymbol,
        label: dtfSymbol,
        icon: dtfData ? (
          <TokenLogo
            src={dtfData.logo}
            symbol={dtfSymbol}
            address={dtfData.id}
            chain={dtfData.chain}
            size="lg"
          />
        ) : (
          <CircleIcon className="h-4 w-4" />
        ),
      }
    })
  }, [availableDtfs, yieldDTFList])

  const handleChange = (selected: string[]) => {
    setSelectedDtfs(selected)
  }

  const displayText = () => {
    if (!selectedDtfs.length) {
      return 'All DTFs'
    }
    return `${selectedDtfs.length} DTF${selectedDtfs.length > 1 ? 's' : ''}`
  }

  // Get tokens for stacked logo display (up to 5)
  const getStackedTokens = useMemo(() => {
    const dtfsToShow = !selectedDtfs.length ? availableDtfs : selectedDtfs
    const limitedDtfs = dtfsToShow.slice(0, 5)

    return limitedDtfs.map((dtfSymbol) => {
      const dtfData = yieldDTFList?.find(dtf => dtf.symbol === dtfSymbol)
      return {
        symbol: dtfSymbol,
        address: dtfData?.id || dtfSymbol,
        chain: dtfData?.chain,
        logo: dtfData?.logo,
      }
    })
  }, [selectedDtfs, availableDtfs, yieldDTFList])

  return (
    <div className="bg-card rounded-3xl hidden lg:block">
      <MultiselectDropdown
        options={options}
        selected={selectedDtfs}
        onChange={handleChange}
        placeholder="Filter by DTFs"
        allOption={true}
        className="w-full min-w-[200px] h-16 px-4 justify-between bg-transparent hover:bg-transparent text-foreground rounded-3xl"
      >
        <div className="flex items-center gap-2">
          {getStackedTokens.length > 0 ? (
            <StackTokenLogo tokens={getStackedTokens} size={16} overlap={4} outsource={false} />
          ) : (
            <CircleIcon className="h-4 w-4" />
          )}
          <span className="text-sm font-normal">{displayText()}</span>
        </div>
      </MultiselectDropdown>
    </div>
  )
}

const TableFilters = () => {
  const [search, setSearch] = useAtom(searchFilterAtom)
  const [chains, setChains] = useAtom(chainsFilterAtom)

  return (
    <div className="flex flex-col items-stretch lg:flex-row lg:items-center gap-[2px] lg:gap-1">
      <SearchInput
        placeholder="Search DTF name or symbol"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-grow [&_input]:border-none [&_input]:rounded-none [&_input]:rounded-tl-3xl [&_input]:rounded-tr-3xl lg:[&_input]:rounded-3xl"
      />
      <DtfFilterDropdown />
      <YieldChainFilter value={chains} onChange={setChains} />
    </div>
  )
}

export default TableFilters