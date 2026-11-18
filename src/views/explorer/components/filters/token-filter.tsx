import rtokens from '@reserve-protocol/rtokens'
import { useDtfMarketCaps } from '@/hooks/use-dtf-status'
import useIndexDTFList from '@/hooks/useIndexDTFList'
import { type DTFType } from '@/views/explorer/components/governance/atoms'
import { Trans, useLingui } from '@lingui/react/macro'
import TokenLogo from 'components/icons/TokenLogo'
import { PillLabel, PillValue } from '../kit/filter-pill'
import InactiveTag from '../kit/inactive-tag'
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

  const marketCaps = useDtfMarketCaps()

  const options = useMemo(() => {
    const list =
      dtfType === 'index'
        ? indexOptions
        : dtfType === 'yield'
          ? yieldOptions
          : [...yieldOptions, ...indexOptions]

    return list
      .map((option) => ({
        ...option,
        suffix: <InactiveTag address={option.value} />,
      }))
      .sort(
        (a, b) =>
          (marketCaps.get(b.value) ?? 0) - (marketCaps.get(a.value) ?? 0)
      )
  }, [dtfType, yieldOptions, indexOptions, marketCaps])

  return (
    <MultiselectDropdrown
      className={className}
      options={options}
      {...props}
      allOption
    >
      <PillLabel>
        <Trans>Token</Trans>
      </PillLabel>
      <PillValue>
        {props.selected.length ? t`${props.selected.length} selected` : t`All`}
      </PillValue>
    </MultiselectDropdrown>
  )
}

export default TokenFilter
