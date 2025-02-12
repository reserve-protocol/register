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

const GovernanceInfo = ({ basket }: { basket?: boolean }) => {
  const indexDTF = useAtomValue(indexDTFAtom)

  if (
    indexDTF &&
    ((basket && !indexDTF.tradingGovernance) ||
      (!basket && !indexDTF.ownerGovernance))
  )
    return null

  const data = basket ? indexDTF?.tradingGovernance : indexDTF?.ownerGovernance

  return (
    <InfoCard title={basket ? t`Basket Governance` : t`Non-Basket Governance`}>
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
    </InfoCard>
  )
}

export default GovernanceInfo
