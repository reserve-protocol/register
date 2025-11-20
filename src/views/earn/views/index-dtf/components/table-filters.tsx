import { SearchInput } from '@/components/ui/input'
import { MultiSelect } from '@/components/ui/multiselect'
import ChainFilter from '@/components/chain-filter'
import { useAtom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  searchFilterAtom,
  chainsFilterAtom,
  dtfsFilterAtom,
  availableDtfsAtom,
} from '../atoms'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ChevronDown } from 'lucide-react'

const DtfFilterDropdown = () => {
  const [selectedDtfs, setSelectedDtfs] = useAtom(dtfsFilterAtom)
  const availableDtfs = useAtomValue(availableDtfsAtom)

  const options = useMemo(() => {
    return availableDtfs.map(dtf => ({
      value: dtf,
      label: dtf,
    }))
  }, [availableDtfs])

  const selectedOptions = useMemo(() => {
    return selectedDtfs.map(dtf => ({
      value: dtf,
      label: dtf,
    }))
  }, [selectedDtfs])

  const handleChange = (selected: any) => {
    setSelectedDtfs(selected ? selected.map((opt: any) => opt.value) : [])
  }

  return (
    <div className="bg-card rounded-3xl hidden lg:block">
      <ToggleGroup
        type="single"
        value=""
        className="px-4 py-4 h-auto"
      >
        <div className="relative w-full min-w-[200px]">
          <MultiSelect
            value={selectedOptions}
            onChange={handleChange}
            options={options}
            placeholder="Filter by DTFs"
            className="w-full"
            classNamePrefix="select"
            components={{
              DropdownIndicator: () => (
                <div className="p-1 text-muted-foreground hover:text-foreground">
                  <ChevronDown size={16} />
                </div>
              ),
            }}
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: 'transparent',
                border: 'none',
                boxShadow: 'none',
                minHeight: '32px',
              }),
              valueContainer: (base) => ({
                ...base,
                padding: '0 8px',
              }),
              placeholder: (base) => ({
                ...base,
                color: 'hsl(var(--muted-foreground))',
              }),
            }}
          />
        </div>
      </ToggleGroup>
    </div>
  )
}

const TableFilters = () => {
  const [search, setSearch] = useAtom(searchFilterAtom)

  return (
    <div className="flex flex-col items-stretch lg:flex-row lg:items-center gap-[2px] lg:gap-1">
      <SearchInput
        placeholder="Search gov token"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-grow [&_input]:border-none [&_input]:rounded-none [&_input]:rounded-tl-3xl [&_input]:rounded-tr-3xl lg:[&_input]:rounded-3xl"
      />
      <DtfFilterDropdown />
      <ChainFilter atom={chainsFilterAtom} />
    </div>
  )
}

export default TableFilters