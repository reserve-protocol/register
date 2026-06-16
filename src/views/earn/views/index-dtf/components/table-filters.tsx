import { SearchInput } from '@/components/ui/input'
import MultiselectDropdown from '@/components/ui/multiselect-dropdown'
import ChainFilter from '@/components/chain-filter'
import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/stack-token-logo'
import { useLingui } from '@lingui/react/macro'
import { useAtom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  searchFilterAtom,
  chainsFilterAtom,
  dtfsFilterAtom,
  availableDtfsAtom,
  dtfDataMapAtom,
  indexDTFListAtom,
} from '../atoms'
import { CircleIcon } from 'lucide-react'

const DtfFilterDropdown = () => {
  const { t } = useLingui()
  const [selectedDtfs, setSelectedDtfs] = useAtom(dtfsFilterAtom)
  const availableDtfs = useAtomValue(availableDtfsAtom)
  const dtfDataMap = useAtomValue(dtfDataMapAtom)
  const indexDTFList = useAtomValue(indexDTFListAtom)

  const options = useMemo(() => {
    return availableDtfs.map((dtfSymbol) => {
      const dtfData = dtfDataMap.get(dtfSymbol)
      return {
        value: dtfSymbol,
        label: dtfSymbol,
        icon: dtfData ? (
          <TokenLogo
            src={dtfData.brand?.icon}
            symbol={dtfSymbol}
            address={dtfData.address}
            chain={dtfData.chainId}
            size="lg"
          />
        ) : (
          <CircleIcon className="h-4 w-4" />
        ),
      }
    })
  }, [availableDtfs, dtfDataMap])

  const handleChange = (selected: string[]) => {
    setSelectedDtfs(selected)
  }

  const displayText = () => {
    if (!selectedDtfs.length) {
      return t`All DTFs`
    }
    return t`${selectedDtfs.length} DTFs`
  }

  // Get tokens for stacked logo display (up to 5)
  const getStackedTokens = useMemo(() => {
    const dtfsToShow = !selectedDtfs.length ? availableDtfs : selectedDtfs
    const limitedDtfs = dtfsToShow.slice(0, 5)

    return limitedDtfs.map((dtfSymbol) => {
      const dtfData = dtfDataMap.get(dtfSymbol)
      return {
        symbol: dtfSymbol,
        address: dtfData?.address || dtfSymbol,
        chain: dtfData?.chainId,
        logo: dtfData?.brand?.icon,
      }
    })
  }, [selectedDtfs, availableDtfs, dtfDataMap])

  return (
    <div className="bg-card rounded-3xl hidden lg:block">
      <MultiselectDropdown
        options={options}
        selected={selectedDtfs}
        onChange={handleChange}
        placeholder={t`Filter by DTFs`}
        allOption={true}
        className="h-[68px] w-full min-w-[200px] justify-between rounded-3xl bg-transparent px-4 text-foreground hover:bg-transparent"
      >
        <div className="flex items-center gap-2">
          {getStackedTokens.length > 0 ? (
            <StackTokenLogo
              tokens={getStackedTokens}
              size={16}
              overlap={4}
              outsource={true}
            />
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
  const { t } = useLingui()
  const [search, setSearch] = useAtom(searchFilterAtom)
  const [chains, setChains] = useAtom(chainsFilterAtom)

  return (
    <div className="flex flex-col items-stretch lg:flex-row lg:items-center gap-[2px] lg:gap-1">
      <SearchInput
        placeholder={t`Search gov token or DTF`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-grow [&_input]:border-none [&_input]:rounded-none [&_input]:rounded-tl-3xl [&_input]:rounded-tr-3xl lg:[&_input]:rounded-3xl"
        inputClassName="h-[68px]"
      />
      <DtfFilterDropdown />
      <ChainFilter value={chains} onChange={setChains} />
    </div>
  )
}

export default TableFilters
