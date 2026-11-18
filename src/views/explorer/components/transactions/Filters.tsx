import { useLingui } from '@lingui/react/macro'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import type { ReactNode } from 'react'
import ChainFilter from '../filters/ChainFilter'
import TokenFilter from '../filters/token-filter'
import TransactionTypeFilter from '../filters/TransactionTypeFilter'
import { ExplorerToolbar } from '../kit/explorer-layout'
import SearchField from '../kit/search-field'
import { debouncedWalletInputAtom, filtersAtom, transactionChains } from './atoms'

const TransactionFilters = ({ children }: { children?: ReactNode }) => {
  const { t } = useLingui()
  const [filters, setFilters] = useAtom(filtersAtom)
  const wallet = useAtomValue(debouncedWalletInputAtom.currentValueAtom)
  const setWallet = useSetAtom(debouncedWalletInputAtom.debouncedValueAtom)

  const handleChange = (key: string, selected: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: selected }))
  }

  return (
    <ExplorerToolbar>
      <SearchField
        label={t`Filter by wallet address`}
        placeholder={t`Wallet address`}
        value={wallet}
        onChange={setWallet}
      />
      <TokenFilter
        selected={filters.tokens}
        onChange={(selected) => handleChange('tokens', selected)}
      />
      <TransactionTypeFilter
        selected={filters.type}
        onChange={(selected) => handleChange('type', selected)}
      />
      <ChainFilter
        chains={transactionChains}
        selected={filters.chains}
        onChange={(selected) => handleChange('chains', selected)}
      />
      {children}
    </ExplorerToolbar>
  )
}

export default TransactionFilters
