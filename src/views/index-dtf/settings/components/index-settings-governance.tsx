import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatPercentage, parseDuration, shortenAddress } from '@/utils'
import { useLingui } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import {
  Calendar1,
  Clock,
  FileLock2,
  Hash,
  Hourglass,
  MousePointerBan,
  Pause,
  ShieldCheck,
} from 'lucide-react'
import { IconWrapper, InfoCard, InfoCardItem } from './settings-info-card'
import { cn } from '@/lib/utils'
import Help from '@/components/ui/help'

export const InnerGovernanceInfo = ({
  kind = 'trading',
  className,
  layout = 'stacked',
}: {
  kind?: 'trading' | 'owner' | 'dao'
  className?: string
  layout?: 'stacked' | 'inline'
}) => {
  const { t } = useLingui()
  const indexDTF = useAtomValue(indexDTFAtom)

  if (!indexDTF) return null

  if (
    (kind === 'trading' && !indexDTF.tradingGovernance) ||
    (kind === 'owner' && !indexDTF.ownerGovernance) ||
    (kind === 'dao' && !indexDTF.stToken?.governance)
  )
    return null

  const data =
    kind === 'trading'
      ? indexDTF.tradingGovernance
      : kind === 'owner'
        ? indexDTF.ownerGovernance
        : indexDTF.stToken?.governance
  const icon = (Component: React.ElementType) =>
    layout === 'inline' ? (
      <Component size={14} strokeWidth={1.75} className="shrink-0" />
    ) : (
      <IconWrapper Component={Component} />
    )

  return (
    <div className={cn(className)}>
      <InfoCardItem
        label={t`Governor Address`}
        icon={icon(Hash)}
        address={data?.id}
        value={data?.id ? shortenAddress(data.id) : undefined}
        border={false}
        layout={layout}
      />
      <InfoCardItem
        label={t`Timelock Address`}
        icon={icon(Hash)}
        address={data?.timelock.id}
        value={data?.timelock.id ? shortenAddress(data.timelock.id) : undefined}
        layout={layout}
      />
      <InfoCardItem
        icon={icon(Pause)}
        label={t`Voting Delay`}
        value={data ? parseDuration(data.votingDelay) : undefined}
        layout={layout}
      />
      <InfoCardItem
        icon={icon(Calendar1)}
        label={t`Voting Period`}
        value={data ? parseDuration(data.votingPeriod) : undefined}
        layout={layout}
      />
      <InfoCardItem
        icon={icon(FileLock2)}
        label={t`Proposal Threshold`}
        value={data ? formatPercentage(data.proposalThreshold) : undefined}
        layout={layout}
      />
      <InfoCardItem
        icon={icon(ShieldCheck)}
        label={t`Voting Quorum`}
        value={data ? formatPercentage(data.quorum) : undefined}
        layout={layout}
      />
      {data?.isOptimistic && data.optimistic && (
        <>
          <InfoCardItem
            icon={icon(Clock)}
            label={t`Veto Delay`}
            value={parseDuration(data.optimistic.vetoDelay)}
            layout={layout}
          />
          <InfoCardItem
            icon={icon(Hourglass)}
            label={t`Veto Window`}
            value={parseDuration(data.optimistic.vetoPeriod)}
            layout={layout}
          />
          <InfoCardItem
            icon={icon(FileLock2)}
            label={t`Veto Threshold`}
            value={formatPercentage(data.optimistic.vetoThreshold)}
            layout={layout}
          />
        </>
      )}
      <InfoCardItem
        icon={icon(MousePointerBan)}
        label={t`Execution Delay`}
        value={data ? parseDuration(data.timelock.executionDelay) : undefined}
        layout={layout}
      />
    </div>
  )
}

const GovernanceInfo = ({
  kind = 'trading',
}: {
  kind?: 'trading' | 'owner' | 'dao'
}) => {
  const { t } = useLingui()
  const indexDTF = useAtomValue(indexDTFAtom)

  if (!indexDTF) return null

  if (
    (kind === 'trading' && !indexDTF.tradingGovernance) ||
    (kind === 'owner' && !indexDTF.ownerGovernance) ||
    (kind === 'dao' && !indexDTF.stToken?.governance) ||
    (kind === 'trading' &&
      indexDTF.tradingGovernance?.id === indexDTF.ownerGovernance?.id)
  )
    return null

  const isOptimistic = !!indexDTF.ownerGovernance?.isOptimistic

  const help =
    kind === 'trading'
      ? t`Controls changes to the basket of an Index DTF`
      : kind === 'owner'
        ? isOptimistic
          ? t`Controls fees, voting parameters, and basket changes for an Index DTF`
          : t`Controls fees, voting parameters, and anything other than basket changes for an Index DTF`
        : t`Controls settings of the vlDAO including vote lock duration and approving revenue tokens`

  return (
    <InfoCard
      title={
        kind === 'trading'
          ? t`Basket Governance`
          : kind === 'owner'
            ? t`DTF Governance`
            : t`DAO Governance`
      }
      id={
        kind === 'trading'
          ? 'basket-governance'
          : kind === 'owner'
            ? 'non-basket-governance'
            : 'dao-governance'
      }
      action={<Help size={20} className="p-0" content={help} />}
    >
      <InnerGovernanceInfo kind={kind} />
    </InfoCard>
  )
}

export default GovernanceInfo
