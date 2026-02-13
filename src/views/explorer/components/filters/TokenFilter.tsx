import rtokens from '@reserve-protocol/rtokens'
import { Trans } from '@lingui/macro'
import CirclesIcon from 'components/icons/CirclesIcon'
import TokenLogo from 'components/icons/TokenLogo'
import useRTokenLogo from 'hooks/useRTokenLogo'
import { useMemo } from 'react'
import { supportedChainList } from 'utils/constants'
import MultiselectDropdrown, {
  IMultiselectDropdrown,
  SelectOption,
} from '../MultiselectDropdown'

const TokenFilter = ({
  className,
  ...props
}: Omit<IMultiselectDropdrown, 'options'>) => {
  const options = useMemo(() => {
    const items: SelectOption[] = []

    for (const chain of supportedChainList) {
      items.push(
        ...Object.values(rtokens[chain] || {}).map((v) => ({
          label: v.symbol,
          value: v.address.toLowerCase(),
          icon: <TokenLogo src={useRTokenLogo(v.address, chain)} />,
        }))
      )
    }

    return items
  }, [])

  return (
    <div className={className}>
      <span className="text-legend">
        <Trans>Tokens</Trans>
      </span>
      <MultiselectDropdrown className="mt-1" options={options} {...props} allOption>
        <CirclesIcon />
        <span className="ml-2 text-legend">
          {props.selected.length
            ? `${props.selected.length} RTokens`
            : 'All RTokens'}
        </span>
      </MultiselectDropdrown>
    </div>
  )
}

export default TokenFilter
