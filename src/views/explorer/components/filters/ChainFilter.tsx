import { Trans, useLingui } from '@lingui/react/macro'
import ChainLogo from 'components/icons/ChainLogo'
import { useMemo } from 'react'
import { CHAIN_TAGS, supportedChainList } from 'utils/constants'
import MultiselectDropdrown, {
  IMultiselectDropdrown,
} from '../MultiselectDropdown'
import { PillLabel, PillValue } from '../kit/filter-pill'

interface ChainFilterProps extends Omit<IMultiselectDropdrown, 'options'> {
  chains?: number[]
}

const ChainFilter = ({
  chains = supportedChainList,
  ...props
}: ChainFilterProps) => {
  const { t } = useLingui()
  const options = useMemo(() => {
    return chains.map((chainId) => ({
      label: CHAIN_TAGS[chainId],
      value: chainId.toString(),
      icon: <ChainLogo chain={chainId} />,
    }))
  }, [chains])
  const { selected } = props
  const isFiltered = selected.length < chains.length

  return (
    <MultiselectDropdrown minLimit={1} options={options} {...props}>
      <PillLabel>
        <Trans>Network</Trans>
      </PillLabel>
      <PillValue highlighted={isFiltered}>
        {!isFiltered
          ? t`All`
          : selected.length === 1
            ? CHAIN_TAGS[Number(selected[0])]
            : t`${selected.length} selected`}
      </PillValue>
    </MultiselectDropdrown>
  )
}

export default ChainFilter
