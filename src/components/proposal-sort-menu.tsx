import { type ProposalSort } from '@/lib/proposal-sort'
import { useLingui } from '@lingui/react/macro'
import TabMenu from 'components/tab-menu'
import { useMemo } from 'react'

const ProposalSortMenu = ({
  value,
  onChange,
  small,
  className,
}: {
  value: ProposalSort
  onChange(sort: ProposalSort): void
  small?: boolean
  className?: string
}) => {
  const { t } = useLingui()
  const items = useMemo(
    () => [
      { key: 'status', label: t`Status`, testid: 'proposal-sort-status' },
      { key: 'newest', label: t`Newest`, testid: 'proposal-sort-newest' },
    ],
    [t]
  )

  return (
    <TabMenu
      items={items}
      active={value}
      onMenuChange={(key) => onChange(key as ProposalSort)}
      small={small}
      className={className}
    />
  )
}

export default ProposalSortMenu
