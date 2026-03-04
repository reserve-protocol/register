import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { debouncedWalletInputAtom, filtersAtom } from './atoms'
import ChainFilter from '../filters/ChainFilter'
import TokenFilter from '../filters/token-filter'
import TransactionTypeFilter from '../filters/TransactionTypeFilter'
import { Trans, t } from '@lingui/macro'
import { Input } from 'components'

const WalletFilter = () => {
  const value = useAtomValue(debouncedWalletInputAtom.currentValueAtom)
  const setValue = useSetAtom(debouncedWalletInputAtom.debouncedValueAtom)

  return (
    <div className="hidden md:block ml-0 md:ml-4 w-40">
      <span className="ml-2 text-legend">
        <Trans>Wallet</Trans>
      </span>
      <Input
        className="mt-1 h-8 text-sm"
        onChange={(e) => setValue(e.target.value)}
        value={value}
        placeholder={t`Input wallet`}
      />
    </div>
  )
}

const TransactionFilters = () => {
  const [filters, setFilters] = useAtom(filtersAtom)

  const handleChange = (key: string, selected: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: selected }))
  }

  return (
    <div className="flex items-center gap-4">
      <WalletFilter />
      <TokenFilter
        className="hidden md:block"
        selected={filters.tokens}
        onChange={(selected) => handleChange('tokens', selected)}
      />
      <TransactionTypeFilter
        selected={filters.type}
        onChange={(selected) => handleChange('type', selected)}
      />
      <ChainFilter
        selected={filters.chains}
        onChange={(selected) => handleChange('chains', selected)}
      />
    </div>
  )
}

export default TransactionFilters
