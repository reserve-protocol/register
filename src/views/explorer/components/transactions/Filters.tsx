import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { debouncedWalletInputAtom, filtersAtom } from './atoms'
import { Box, Flex, Text } from 'theme-ui'
import ChainFilter from '../filters/ChainFilter'
import TokenFilter from '../filters/TokenFilter'
import TransactionTypeFilter from '../filters/TransactionTypeFilter'
import { Trans, t } from '@lingui/macro'
import { Input } from 'components'

const WalletFilter = () => {
  const value = useAtomValue(debouncedWalletInputAtom.currentValueAtom)
  const setValue = useSetAtom(debouncedWalletInputAtom.debouncedValueAtom)

  return (
    <Box ml={[0, 3]} sx={{ width: 160, display: ['none', 'block'] }}>
      <Text ml={2} variant="legend">
        <Trans>Wallet</Trans>
      </Text>
      <Input
        variant="smallInput"
        mt={1}
        onChange={setValue}
        value={value}
        placeholder={t`Input wallet`}
      />
    </Box>
  )
}

const TransactionFilters = () => {
  const [filters, setFilters] = useAtom(filtersAtom)

  const handleChange = (key: string, selected: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: selected }))
  }

  return (
    <Box variant="layout.verticalAlign" sx={{ gap: 3 }}>
      <WalletFilter />
      <TokenFilter
        sx={{ display: ['none', 'block'] }}
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
    </Box>
  )
}

export default TransactionFilters
