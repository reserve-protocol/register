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
        value={data ? formatPercentage(data.quorumNumerator) : undefined}
      />
      <InfoCardItem
        icon={<IconWrapper Component={MousePointerBan} />}
        label={t`Execution Delay`}
        value={data ? parseDuration(data.timelock.executionDelay) : undefined}
      />
    </div>
  )
}

const GovernanceInfo = ({
  kind = 'trading',
}: {
  kind?: 'trading' | 'owner' | 'dao'
}) => {
  const indexDTF = useAtomValue(indexDTFAtom)

  if (!indexDTF) return null

  if (
    (kind === 'trading' && !indexDTF.tradingGovernance) ||
    (kind === 'owner' && !indexDTF.ownerGovernance) ||
    (kind === 'dao' && !indexDTF.stToken?.governance)
  )
    return null

  return (
    <InfoCard
      title={
        kind === 'trading'
          ? t`Basket Governance`
          : kind === 'owner'
            ? t`Non-Basket Governance`
            : t`DAO Governance`
      }
      id={
        kind === 'trading'
          ? 'basket-governance'
          : kind === 'owner'
            ? 'non-basket-governance'
            : 'dao-governance'
      }
    >
      <InnerGovernanceInfo kind={kind} />
    </InfoCard>
  )
}

export default GovernanceInfo
