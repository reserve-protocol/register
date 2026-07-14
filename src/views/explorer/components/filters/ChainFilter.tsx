import MultiselectDropdrown, {
  IMultiselectDropdrown,
} from '../MultiselectDropdown'
import { useMemo } from 'react'
import { CHAIN_TAGS, supportedChainList } from 'utils/constants'
import ChainLogo from 'components/icons/ChainLogo'
import StackedChainLogo from 'components/icons/StackedChainLogo'
import { Plural, Trans } from '@lingui/react/macro'

interface ChainFilterProps extends Omit<IMultiselectDropdrown, 'options'> {
  chains?: number[]
}

const ChainFilter = ({ chains = supportedChainList, ...props }: ChainFilterProps) => {
  const options = useMemo(() => {
    return chains.map((chainId) => ({
      label: CHAIN_TAGS[chainId],
      value: chainId.toString(),
      icon: <ChainLogo chain={chainId} />,
    }))
  }, [chains])

  return (
    <div>
      <span className="text-legend">
        <Trans>Networks</Trans>
      </span>
      <MultiselectDropdrown className="mt-1" minLimit={1} options={options} {...props}>
        <StackedChainLogo chains={props.selected.map((v) => Number(v))} />
        <span className="text-legend">
          <Plural
            value={props.selected.length}
            one="# chain"
            other="# chains"
          />
        </span>
      </MultiselectDropdrown>
    </div>
  )
}

export default ChainFilter
