import { Trans, t } from '@lingui/macro'
import { Input } from 'components'
import Help from 'components/help'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
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
    <div className="ml-0 sm:ml-4 w-full sm:w-[300px]">
      <span className="ml-2 text-legend">
        <Trans>Search</Trans>
      </span>
      <Input
        className="mt-1"
        onChange={(e) => setValue(e.target.value)}
        value={value}
        placeholder={t`Input token name or symbol`}
      />
    </div>
  )
}

const ChainSelectFilter = () => {
  const [value, setValue] = useAtom(chainFilterAtom)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(+e.target.value)
  }

  return (
    <div className="ml-0 sm:ml-8 mt-4 sm:mt-0 w-full sm:w-auto">
      <span className="ml-2 text-legend">
        <Trans>Network</Trans>
      </span>
      <select
        className="mt-1 w-full sm:w-[120px] p-3 border border-input rounded-lg bg-background outline-none"
        onChange={handleChange}
        value={value}
      >
        <option value={0}>All</option>
        {supportedChainList.map((chain) => (
          <option key={chain} value={chain}>
            {CHAIN_TAGS[chain]}
          </option>
        ))}
      </select>
    </div>
  )
}

const RecordLimitSelect = () => {
  const [value, setValue] = useAtom(recordLimitAtom)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(+e.target.value)
  }

  return (
    <div className="hidden sm:block ml-0 sm:ml-8 mt-4 sm:mt-0">
      <div className="flex items-center">
        <span className="ml-2 mr-2 text-legend">
          <Trans>Record limit</Trans>
        </span>
        <Help content="Limit of records per chain" />
      </div>

      <select
        className="mt-1 w-[120px] p-3 border border-input rounded-lg bg-background outline-none"
        onChange={handleChange}
        value={value}
      >
        <option>10</option>
        <option>50</option>
        <option>100</option>
        <option>200</option>
        <option>500</option>
        <option>1000</option>
      </select>
    </div>
  )
}

const RTokenFilters = () => {
  return (
    <div className="flex items-center justify-center flex-col sm:flex-row mb-8 mx-4 sm:mx-0">
      <TokenSearchInput />
      <ChainSelectFilter />
      <RecordLimitSelect />
    </div>
  )
}

export default RTokenFilters
