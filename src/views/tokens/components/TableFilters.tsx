import { Trans, t } from '@lingui/macro'
import { Input } from 'components'
import Help from 'components/help'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Box, Select, Text } from 'theme-ui'
import { CHAIN_TAGS, supportedChainList } from 'utils/constants'
import {
  chainFilterAtom,
  debouncedSearchInputAtom,
  recordLimitAtom,
} from '../atoms'

const TokenSearchInput = () => {
  const value = useAtomValue(debouncedSearchInputAtom.currentValueAtom)
  const setValue = useSetAtom(debouncedSearchInputAtom.debouncedValueAtom)

  return (
    <Box ml={[0, 3]} sx={{ width: ['100%', 300] }}>
      <Text ml={2} variant="legend">
        <Trans>Search</Trans>
      </Text>
      <Input
        mt={1}
        onChange={setValue}
        value={value}
        placeholder={t`Input token name or symbol`}
      />
    </Box>
  )
}

const ChainSelectFilter = () => {
  const [value, setValue] = useAtom(chainFilterAtom)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(+e.target.value)
  }

  return (
    <Box ml={[0, 5]} mt={[3, 0]} sx={{ width: ['100%', 'auto'] }}>
      <Text ml={2} variant="legend">
        <Trans>Network</Trans>
      </Text>
      <Select
        mt={1}
        onChange={handleChange}
        sx={{ width: ['100%', 120] }}
        value={value}
      >
        <option value={0}>All</option>
        {supportedChainList.map((chain) => (
          <option key={chain} value={chain}>
            {CHAIN_TAGS[chain]}
          </option>
        ))}
      </Select>
    </Box>
  )
}

const RecordLimitSelect = () => {
  const [value, setValue] = useAtom(recordLimitAtom)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(+e.target.value)
  }

  return (
    <Box ml={[0, 5]} mt={[3, 0]} sx={{ display: ['none', 'block'] }}>
      <Box variant="layout.verticalAlign">
        <Text ml={2} mr={2} variant="legend">
          <Trans>Record limit</Trans>
        </Text>
        <Help content="Limit of records per chain" />
      </Box>

      <Select mt={1} onChange={handleChange} value={value} sx={{ width: 120 }}>
        <option>10</option>
        <option>50</option>
        <option>100</option>
        <option>200</option>
        <option>500</option>
        <option>1000</option>
      </Select>
    </Box>
  )
}

const RTokenFilters = () => {
  return (
    <Box
      variant="layout.verticalAlign"
      sx={{ justifyContent: ['center'], flexDirection: ['column', 'row'] }}
      mb={5}
      mx={[3, 0]}
    >
      <TokenSearchInput />
      <ChainSelectFilter />
      <RecordLimitSelect />
    </Box>
  )
}

export default RTokenFilters
