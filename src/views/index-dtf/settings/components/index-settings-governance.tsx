import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatPercentage, parseDuration, shortenAddress } from '@/utils'
import { t } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import {
  Calendar1,
  FileLock2,
  Hash,
  MousePointerBan,
  Pause,
  ShieldCheck,
} from 'lucide-react'
import { formatEther } from 'viem'
import { IconWrapper, InfoCard, InfoCardItem } from './settings-info-card'
import { cn } from '@/lib/utils'
import Help from '@/components/ui/help'
import useOptimisticGovernance from '../use-optimistic-governance'
import type { IndexDTFGovernance } from '@/types'

const OptimisticGovernanceInfo = ({
  governance,
}: {
  governance?: IndexDTFGovernance
}) => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const {
    isOptimisticGovernance,
    optimisticParams,
    proposalThrottleCapacity,
    selectorAllowlist,
  } = useOptimisticGovernance(indexDTF, governance)

  if (!isOptimisticGovernance || !optimisticParams) return null

  return (
    <>
      <div className="border-t px-4 pt-4 pb-2">
        <p className="text-sm font-semibold text-primary">{t`Optimistic Governance`}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t`These settings only apply to optimistic proposals and are separate from the standard Folio governance parameters above.`}
        </p>
      </div>
      <InfoCardItem
        icon={<IconWrapper Component={Pause} />}
        label={t`Optimistic Veto Delay`}
        value={parseDuration(optimisticParams.vetoDelay)}
        border={false}
      />
      <InfoCardItem
        icon={<IconWrapper Component={Calendar1} />}
        label={t`Optimistic Veto Period`}
        value={parseDuration(optimisticParams.vetoPeriod)}
      />
      <InfoCardItem
        icon={<IconWrapper Component={ShieldCheck} />}
        label={t`Veto Threshold`}
        value={formatPercentage(Number(formatEther(optimisticParams.vetoThreshold)) * 100)}
      />
      <InfoCardItem
        icon={<IconWrapper Component={MousePointerBan} />}
        label={t`Optimistic Proposal Rate Limit`}
        value={
          proposalThrottleCapacity
            ? t`${proposalThrottleCapacity} proposals per account / day`
            : undefined
        }
      />
      {selectorAllowlist.length > 0 && (
        <div className="border-t px-4 pt-4 pb-2">
          <p className="text-sm font-semibold text-primary">{t`Selector Allowlist`}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t`Only these function calls can use the optimistic proposal path.`}
          </p>
        </div>
      )}
      {selectorAllowlist.map((item, index) => (
        <InfoCardItem
          key={`${item.target}-${item.selector}`}
          icon={<IconWrapper Component={FileLock2} />}
          label={t`Allowed Optimistic Call`}
          address={item.target}
          bold={false}
          border={!selectorAllowlist.length || !!index}
          value={
            <span className="inline-flex flex-col">
              <span className="font-bold text-foreground">{item.functionName}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {item.selector}
              </span>
            </span>
          }
        />
      ))}
    </>
  )
}

export const InnerGovernanceInfo = ({
  kind = 'trading',
  className,
}: {
  kind?: 'trading' | 'owner' | 'dao'
  className?: string
}) => {
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

  return (
    <div className={cn(className)}>
      <InfoCardItem
        label={t`Governor Address`}
        icon={<IconWrapper Component={Hash} />}
        address={data?.id}
        value={data?.id ? shortenAddress(data.id) : undefined}
        border={false}
      />
      <InfoCardItem
        label={t`Timelock Address`}
        icon={<IconWrapper Component={Hash} />}
        address={data?.timelock.id}
        value={data?.timelock.id ? shortenAddress(data.timelock.id) : undefined}
      />
      <InfoCardItem
        icon={<IconWrapper Component={Pause} />}
        label={t`Voting Delay`}
        value={data ? parseDuration(data.votingDelay) : undefined}
      />
      <InfoCardItem
        icon={<IconWrapper Component={Calendar1} />}
        label={t`Voting Period`}
        value={data ? parseDuration(data.votingPeriod) : undefined}
      />
      <InfoCardItem
        icon={<IconWrapper Component={FileLock2} />}
        label={t`Proposal Threshold`}
        value={
          data
            ? formatPercentage(
                Number(formatEther(BigInt(data.proposalThreshold)))
              )
            : undefined
      }
      />
      <InfoCardItem
        icon={<IconWrapper Component={ShieldCheck} />}
        label={t`Voting Quorum`}
        value={data ? formatPercentage(data.quorum) : undefined}
      />
      <InfoCardItem
        icon={<IconWrapper Component={MousePointerBan} />}
        label={t`Execution Delay`}
        value={data ? parseDuration(data.timelock.executionDelay) : undefined}
      />
      {kind !== 'dao' && <OptimisticGovernanceInfo governance={data} />}
    </div>
  )
}

const GovernanceInfo = ({
  kind = 'trading',
}: {
  kind?: 'trading' | 'owner' | 'dao'
}) => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const isSingleGovernor =
    !!indexDTF?.tradingGovernance && !indexDTF?.ownerGovernance

  if (!indexDTF) return null

  if (
    (kind === 'trading' && !indexDTF.tradingGovernance) ||
    (kind === 'owner' && !indexDTF.ownerGovernance) ||
    (kind === 'dao' && !indexDTF.stToken?.governance)
  )
    return null

  const help =
    kind === 'trading' && isSingleGovernor
      ? 'Controls all governance actions for this Folio'
      : kind === 'trading'
      ? t`Controls changes to the basket of an Index DTF`
      : kind === 'owner'
        ? t`Controls fees, voting parameters, and anything other than basket changes for an Index DTF`
        : t`Controls settings of the vlDAO including vote lock duration and approving revenue tokens`

  return (
    <InfoCard
      title={
        kind === 'trading' && isSingleGovernor
          ? 'Folio Governance'
          : kind === 'trading'
          ? t`Basket Governance`
          : kind === 'owner'
            ? t`Non-Basket Governance`
            : t`DAO Governance`
      }
      id={
        kind === 'trading' && isSingleGovernor
          ? 'folio-governance'
          : kind === 'trading'
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
