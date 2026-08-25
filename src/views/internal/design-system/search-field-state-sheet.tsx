import { type ReactNode, useState } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'
import { SearchField } from '@/components/design-system-v1/search-field'

const SearchFieldStateSheet = () => {
  const [query, setQuery] = useState('ethereum')
  const [filterQuery, setFilterQuery] = useState('')
  const [loadingQuery, setLoadingQuery] = useState('coinmarketcap')

  return (
    <section
      data-testid="search-field-state-sheet"
      className="space-y-6"
      aria-labelledby="search-field-state-sheet-title"
    >
      <div>
        <p className="text-sm font-medium text-primary">
          Reusable candidate · canonical review
        </p>
        <h2
          id="search-field-state-sheet-title"
          className="mt-1 text-2xl font-light"
        >
          Search field
        </h2>
        <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
          Search inherits the accepted 44px TextInput geometry and adds only the
          semantics it owns: a leading search mark, search input behavior, an
          optional clear action that returns focus, and a restrained loading
          indicator. Results, no-results recovery, grouping, and selection stay
          with the surrounding list, command dialog, or asset picker.
        </p>
      </div>

      <div className="grid gap-0.5 bg-secondary p-0.5 xl:grid-cols-3">
        <Specimen label="Empty · standalone filter">
          <SearchField
            aria-label="Search DTFs"
            placeholder="Search by name, ticker, tag or collateral"
          />
        </Specimen>

        <Specimen label="Query · clearable">
          <SearchField
            aria-label="Search DTFs"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery('')}
          />
        </Specimen>

        <Specimen label="Loading · query retained">
          <SearchField
            aria-label="Search DTFs"
            value={loadingQuery}
            onChange={(event) => setLoadingQuery(event.target.value)}
            loading
          />
        </Specimen>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Real composition pressure test · Discover-style filters
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <SearchField
            aria-label="Search DTFs"
            placeholder="Search by name, ticker, tag or collateral"
            value={filterQuery}
            onChange={(event) => setFilterQuery(event.target.value)}
            onClear={() => setFilterQuery('')}
            className="sm:flex-1"
          />
          <Select defaultValue="all">
            <SelectTrigger aria-label="Chain" className="sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All chains</SelectItem>
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="base">Base</SelectItem>
              <SelectItem value="bsc">BSC</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="mt-2 text-sm font-light leading-5 text-muted-foreground">
          Judge the shared 44px outer axis and search-specific controls only.
          Discover filter framing, chain-filter content, result layout, and
          responsive substitution remain composition-owned.
        </p>
      </div>
    </section>
  )
}

const Specimen = ({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) => (
  <div className="bg-card">
    <p className="border-b border-border px-4 py-2 text-xs font-light uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div className="flex min-h-32 items-center p-6">{children}</div>
  </div>
)

export default SearchFieldStateSheet
