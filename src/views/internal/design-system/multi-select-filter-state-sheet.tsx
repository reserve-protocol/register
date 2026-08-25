import { useState } from 'react'

import { ChainLogoStack } from '@/components/entity-identity'
import ChainLogo from '@/components/icons/ChainLogo'
import {
  MultiSelectFilter,
  type MultiSelectFilterOption,
} from '@/components/design-system-v1/multi-select-filter'

const NETWORKS: readonly MultiSelectFilterOption[] = [
  {
    value: '1',
    label: 'Ethereum',
    leadingVisual: <ChainLogo chain={1} width={20} height={20} />,
  },
  {
    value: '8453',
    label: 'Base',
    leadingVisual: <ChainLogo chain={8453} width={20} height={20} />,
  },
  {
    value: '56',
    label: 'BNB Smart Chain',
    leadingVisual: <ChainLogo chain={56} width={20} height={20} />,
  },
]

const MultiSelectFilterStateSheet = () => {
  const [selected, setSelected] = useState(['8453', '56'])
  const visibleChains = selected.length
    ? selected.map(Number)
    : NETWORKS.map((option) => Number(option.value))

  return (
    <section
      data-testid="multi-select-filter-state-sheet"
      className="space-y-4"
      aria-labelledby="multi-select-filter-state-sheet-title"
    >
      <div>
        <h2
          id="multi-select-filter-state-sheet-title"
          className="text-xl font-medium"
        >
          Multi-select filter
        </h2>
        <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
          Accepted baseline derived from the real Earn DTF and governance filter
          jobs. It covers the summary trigger, balanced identity and Checkbox
          rows, staged selection, and the compact footer action relationship.
          Search, token-result density, mobile drawer substitution, and
          production adoption remain separate.
        </p>
      </div>

      <div className="border border-border bg-card p-6">
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Interactive · network filter
        </p>
        <MultiSelectFilter
          accessibleLabel="Filter by network"
          options={NETWORKS}
          selected={selected}
          onApply={setSelected}
          triggerContent={
            <>
              <ChainLogoStack chains={visibleChains} size={16} />
              <span>
                {selected.length === 0
                  ? 'All networks'
                  : selected.length === 1
                    ? '1 network'
                    : `${selected.length} networks`}
              </span>
            </>
          }
        />
      </div>
    </section>
  )
}

export default MultiSelectFilterStateSheet
