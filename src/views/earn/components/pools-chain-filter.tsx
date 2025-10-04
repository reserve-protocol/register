import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { poolChainsFilterAtom } from '../atoms'
import { ChainId } from '@/utils/chains'
import ChainLogo from '@/components/icons/ChainLogo'
import { LayoutGrid } from 'lucide-react'
import { devModeAtom } from '@/state/atoms'

const PoolsChainFilter = () => {
  const [currentFilter, setFilters] = useAtom(poolChainsFilterAtom)
  const isDevMode = useAtomValue(devModeAtom)

  const chains = [
    {
      icon: <LayoutGrid />,
      text: 'All chains',
      filter: [ChainId.Base.toString(), ChainId.Mainnet.toString()],
    },
    {
      icon: <ChainLogo chain={ChainId.Mainnet} />,
      text: 'Ethereum',
      filter: [ChainId.Mainnet.toString()],
    },
    {
      icon: <ChainLogo chain={ChainId.Base} />,
      text: 'Base',
      filter: [ChainId.Base.toString()],
    },
  ]

  // Determine selected based on current filter
  const getSelectedIndex = () => {
    if (currentFilter.length > 1) return '0' // All chains
    if (currentFilter[0] === ChainId.Mainnet.toString()) return '1'
    if (currentFilter[0] === ChainId.Base.toString()) return '2'
    return '0'
  }

  const [selected, setSelected] = useState(getSelectedIndex())

  // Update selected when filter changes externally
  useEffect(() => {
    setSelected(getSelectedIndex())
  }, [currentFilter])

  const handleSelect = (value: string) => {
    setSelected(value)
    setFilters(chains[Number(value)]?.filter ?? [])
  }

  return (
    <ToggleGroup
      type="single"
      value={selected}
      onValueChange={handleSelect}
      className="bg-card rounded-br-3xl sm:rounded-3xl px-4 py-4 h-auto"
    >
      {chains.map(({ text, icon }, index) => (
        <ToggleGroupItem
          key={text}
          value={index.toString()}
          className="flex items-center gap-0 h-8 px-2 data-[state=on]:bg-muted data-[state=on]:text-primary hover:text-primary hover:bg-muted"
        >
          {icon}
          <span className="hidden sm:block ml-[6px]">{text}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export default PoolsChainFilter
