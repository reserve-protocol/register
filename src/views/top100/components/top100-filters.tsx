import ChainLogo from '@/components/icons/ChainLogo'
import { SearchInput } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ChainId } from '@/utils/chains'
import { msg } from '@lingui/core/macro'
import type { MessageDescriptor } from '@lingui/core'
import { useLingui } from '@lingui/react/macro'
import { useAtom, useSetAtom } from 'jotai'
import { LayoutGrid } from 'lucide-react'
import { useState } from 'react'
import { chainFilterAtom, searchFilterAtom } from '../atoms'
import { ALL_TOP100_CHAINS } from '../constants'

const CHAIN_OPTIONS: {
  id: string
  icon: React.ReactNode
  text: string | MessageDescriptor
  filter: number[]
}[] = [
  // Only add "All chains" if multiple chains are active
  ...(ALL_TOP100_CHAINS.length > 1
    ? [
        {
          id: 'all',
          icon: <LayoutGrid />,
          text: msg`All chains`,
          filter: ALL_TOP100_CHAINS,
        },
      ]
    : []),
  // Add individual chain toggles for active chains
  ...(ALL_TOP100_CHAINS.includes(ChainId.Mainnet)
    ? [
        {
          id: 'ethereum',
          icon: <ChainLogo chain={ChainId.Mainnet} />,
          text: 'Ethereum',
          filter: [ChainId.Mainnet],
        },
      ]
    : []),
  ...(ALL_TOP100_CHAINS.includes(ChainId.Base)
    ? [
        {
          id: 'base',
          icon: <ChainLogo chain={ChainId.Base} />,
          text: 'Base',
          filter: [ChainId.Base],
        },
      ]
    : []),
  ...(ALL_TOP100_CHAINS.includes(ChainId.BSC)
    ? [
        {
          id: 'binance',
          icon: <ChainLogo chain={ChainId.BSC} />,
          text: 'Binance',
          filter: [ChainId.BSC],
        },
      ]
    : []),
]

const ChainFilter = () => {
  const { t } = useLingui()
  const [selected, setSelected] = useState('0')
  const setFilters = useSetAtom(chainFilterAtom)

  const handleSelect = (value: string) => {
    if (!value) return
    setSelected(value)
    setFilters(CHAIN_OPTIONS[Number(value)]?.filter ?? ALL_TOP100_CHAINS)
  }

  // Don't render chain toggle if only one chain
  if (CHAIN_OPTIONS.length <= 1) return null

  return (
    <ToggleGroup
      type="single"
      value={selected}
      onValueChange={handleSelect}
      className="bg-card rounded-bl-3xl rounded-br-3xl sm:rounded-3xl px-4 py-4"
    >
      {CHAIN_OPTIONS.map(({ id, text, icon }, index) => (
        <ToggleGroupItem
          key={id}
          value={index.toString()}
          className="flex items-center gap-0 h-8 px-2 data-[state=on]:bg-muted data-[state=on]:text-primary hover:text-primary hover:bg-muted"
        >
          {icon}
          <div className="hidden sm:block ml-[6px]">
            {typeof text === 'string' ? text : t(text)}
          </div>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

const SearchFilter = () => {
  const { t } = useLingui()
  const [search, setSearch] = useAtom(searchFilterAtom)

  return (
    <SearchInput
      placeholder={t`Search by name, ticker or collateral`}
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="flex-grow [&_input]:border-none [&_input]:rounded-none [&_input]:rounded-tl-3xl [&_input]:rounded-tr-3xl sm:[&_input]:rounded-3xl"
    />
  )
}

const Top100Filters = () => {
  return (
    <div className="flex flex-col items-stretch sm:flex-row sm:items-center gap-[2px] sm:gap-1">
      <SearchFilter />
      <ChainFilter />
    </div>
  )
}

export default Top100Filters
