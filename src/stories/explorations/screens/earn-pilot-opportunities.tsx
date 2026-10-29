import { useState } from 'react'
import { MultiSelectFilter } from '@/components/design-system-v1/multi-select-filter'
import { SearchField } from '@/components/design-system-v1/search-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/design-system-v1/segmented-control'
import { ChainLogoStack } from '@/components/entity-identity'
import ChainLogo from '@/components/icons/ChainLogo'
import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
import { DefiTable } from '../../patterns/market/reference/table-family/defi-table'
import { previewDefi } from '../../patterns/market/reference/table-family/defi-fixtures'
import {
  EARN_ROWS,
  previewEarn,
  type EarnState,
} from '../../patterns/market/reference/table-family/earn-fixtures'
import { EarnTable } from '../../patterns/market/reference/table-family/earn-table'

const networks = [
  { id: 1, label: 'Ethereum' },
  { id: 8453, label: 'Base' },
  { id: 56, label: 'Binance' },
]

export function EarnPilotOpportunities({
  family,
  state,
  wallet,
}: {
  family: 'index' | 'yield' | 'defi'
  state: EarnState
  wallet: boolean
}) {
  const [search, setSearch] = useState('')
  const [selectedDtfs, setSelectedDtfs] = useState<string[]>([])
  const [chain, setChain] = useState('all')
  const dtfOptions = [
    ...new Set(
      EARN_ROWS.filter((row) => row.family === family).flatMap((row) =>
        row.governs.map((asset) => asset.symbol)
      )
    ),
  ]
    .sort()
    .map((symbol) => ({ value: symbol, label: symbol }))
  const searchLabel =
    family === 'index'
      ? 'Search gov token or DTF'
      : family === 'yield'
        ? 'Search DTF name or symbol'
        : 'Search pool'
  const query = search.trim().toLowerCase()
  const filteredEmpty =
    chain !== 'all' || selectedDtfs.length > 0 || query ? (
      <EmptyState
        mode="actionable"
        title="No matching opportunities"
        description="Try another chain, search or DTF filter."
        actions={
          <Button
            tone="secondary"
            onClick={() => {
              setSearch('')
              setSelectedDtfs([])
              setChain('all')
            }}
          >
            Clear filters
          </Button>
        }
      />
    ) : undefined
  const earnRows =
    family === 'defi'
      ? []
      : previewEarn(family, state)
          .flatMap((row) => [
            row,
            { ...row, id: `${row.id}-additional-example` },
          ])
          .filter(
            (row) =>
              (chain === 'all' || String(row.chain) === chain) &&
              (!selectedDtfs.length ||
                row.governs.some((asset) =>
                  selectedDtfs.includes(asset.symbol)
                )) &&
              [
                row.symbol,
                row.name,
                row.vault,
                ...row.governs.flatMap((asset) => [asset.symbol, asset.name]),
              ].some((value) => value.toLowerCase().includes(query))
          )
  const defiRows =
    family !== 'defi'
      ? []
      : previewDefi(state)
          .flatMap((row) => [
            row,
            { ...row, id: `${row.id}-additional-example` },
          ])
          .filter(
            (row) =>
              (chain === 'all' ||
                row.chain ===
                  networks.find((network) => String(network.id) === chain)
                    ?.label) &&
              [row.symbol, row.projectName].some((value) =>
                value.toLowerCase().includes(query)
              )
          )
  return (
    <>
      <div
        className="grid min-w-0 gap-x-2 gap-y-3 p-[var(--screen-content-inset,theme(spacing.6))] min-[360px]:grid-cols-2 sm:grid-cols-1 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,1fr)_auto_auto]"
        data-testid="earn-pilot-filters"
      >
        <SearchField
          aria-label={searchLabel}
          placeholder={searchLabel}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          onClear={() => setSearch('')}
          className="min-[360px]:col-span-2 sm:col-span-1 lg:col-span-2 xl:col-span-1"
        />
        {family !== 'defi' && (
          <MultiSelectFilter
            accessibleLabel="Filter by DTFs"
            options={dtfOptions}
            selected={selectedDtfs}
            onApply={setSelectedDtfs}
            triggerContent={
              selectedDtfs.length ? `${selectedDtfs.length} DTFs` : 'All DTFs'
            }
          />
        )}
        <div
          className={
            family === 'defi'
              ? 'min-[360px]:col-span-2 sm:hidden'
              : 'min-w-0 sm:hidden'
          }
        >
          <Select value={chain} onValueChange={setChain}>
            <SelectTrigger aria-label="Filter by chain">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All chains</SelectItem>
              {networks.map((network) => (
                <SelectItem key={network.id} value={String(network.id)}>
                  {network.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="hidden min-w-0 overflow-x-auto sm:block">
          <SegmentedControl
            presentation="contained"
            aria-label="All chains"
            value={chain}
            onValueChange={setChain}
          >
            <SegmentedControlItem value="all" className="gap-2">
              <ChainLogoStack
                chains={networks.map((network) => network.id)}
                aria-hidden="true"
              />
              All chains
            </SegmentedControlItem>
            {networks.map((network) => (
              <SegmentedControlItem
                key={network.id}
                value={String(network.id)}
                className="gap-2"
              >
                <ChainLogo
                  chain={network.id}
                  aria-hidden="true"
                  className="size-4"
                />
                {network.label}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="h-px bg-secondary"
        data-testid="earn-pilot-filter-seam"
      />
      {family === 'defi' ? (
        <DefiTable state={state} rows={defiRows} noResults={filteredEmpty} />
      ) : (
        <EarnTable
          rows={earnRows}
          state={state}
          family={family}
          wallet={wallet}
          sortMenuPresentation="dropdown"
          noResults={filteredEmpty}
          onOpen={() => undefined}
          onHelp={() => undefined}
        />
      )}
    </>
  )
}
