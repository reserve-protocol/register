import rtokens from '@reserve-protocol/rtokens'
import useIndexDTFList from '@/hooks/useIndexDTFList'
import { type DTFType } from '@/views/explorer/components/governance/atoms'
import { Trans, useLingui } from '@lingui/react/macro'
import CirclesIcon from 'components/icons/CirclesIcon'
import TokenLogo from 'components/icons/TokenLogo'
import useRTokenLogo from 'hooks/useRTokenLogo'
import { useMemo } from 'react'
import { supportedChainList } from 'utils/constants'
import MultiselectDropdrown, {
  IMultiselectDropdrown,
  SelectOption,
} from '../MultiselectDropdown'

const useYieldTokenOptions = (): SelectOption[] => {
  return useMemo(() => {
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
}

const useIndexTokenOptions = (): SelectOption[] => {
  const { data: indexDTFs } = useIndexDTFList()

  return useMemo(() => {
    if (!indexDTFs) return []

    return indexDTFs.map((dtf) => ({
      label: dtf.symbol,
      value: dtf.address.toLowerCase(),
      icon: dtf.brand?.icon ? (
        <TokenLogo src={dtf.brand.icon} />
      ) : null,
    }))
  }, [indexDTFs])
}

const TokenFilter = ({
  className,
  dtfType,
  ...props
}: Omit<IMultiselectDropdrown, 'options'> & { dtfType?: DTFType }) => {
  const { t } = useLingui()
  const yieldOptions = useYieldTokenOptions()
  const indexOptions = useIndexTokenOptions()

  const options = useMemo(() => {
    if (dtfType === 'index') return indexOptions
    if (dtfType === 'yield') return yieldOptions
    return [...yieldOptions, ...indexOptions]
  }, [dtfType, yieldOptions, indexOptions])

  const allLabel = dtfType === 'index' ? t`All DTFs` : t`All tokens`

  return (
    <div className={className}>
      <span className="text-legend">
        <Trans>Tokens</Trans>
      </span>
      <MultiselectDropdrown className="mt-1" options={options} {...props} allOption>
        <CirclesIcon />
        <span className="ml-2 text-legend">
          {props.selected.length
            ? t`${props.selected.length} selected`
            : allLabel}
        </span>
      </MultiselectDropdrown>
    </div>
  )
}

export default TokenFilter
