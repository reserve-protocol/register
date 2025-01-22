import dtfIndexGovernance from '@/abis/dtf-index-governance'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency, getCurrentTime } from '@/utils'
import { t } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { Address, formatEther } from 'viem'
import { useReadContract } from 'wagmi'
import { governanceStatsAtom } from '../atoms'

const useVotingPower = (): number => {
  const account = useAtomValue(walletAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const { data: votes } = useReadContract({
    address: dtf?.stToken?.id ?? '0x',
    functionName: 'getVotes',
    abi: dtfIndexGovernance,
    args: [account as Address, BigInt(getCurrentTime() - 12)],
    chainId,
    query: {
      enabled: !!account && !!dtf?.stToken?.id && !!chainId,
    },
  })

  return votes ? +formatEther(votes) : 0
}

const VotingPower = () => {
  const votingPower = useVotingPower()

  return (
    <div className="flex flex-col gap-4 p-6">
      <h4 className="font-semibold">Voting power</h4>
      <IconInfo
        icon={<img alt="vote-supply" src="/svgs/vote-supply.svg" />}
        title={t`current`}
        text={formatCurrency(votingPower)}
      />
    </div>
  )
}

export interface IconInfoProps {
  icon: any
  text: string
  title: string
  help?: string
  className?: string
  loading?: boolean
}

const IconInfo = ({
  icon,
  title,
  text,
  help,
  className,
  loading,
}: IconInfoProps) => (
  <div className={cn('flex items-center', className)}>
    {icon}
    <div className="ml-2">
      <div className="flex items-center">
        <span className="text-legend text-sm">{title}</span>
      </div>
      {loading ? <Skeleton className="h-4 w-24" /> : <span>{text}</span>}
    </div>
  </div>
)

const GovernanceStats = () => {
  const stats = useAtomValue(governanceStatsAtom)

  return (
    <div className="flex rounded-3xl bg-secondary">
      <div className="bg-card m-1 grid grid-cols-2 w-full rounded-3xl">
        <div className="flex flex-col gap-4 p-6 border-b border-r">
          <h4 className="font-semibold">Proposals</h4>
          <IconInfo
            icon={<img alt="proposals" src="/svgs/proposals.svg" />}
            title={t`All time`}
            text={formatCurrency(stats?.proposalCount ?? 0, 0)}
            loading={!stats}
          />
        </div>
        <div className="flex flex-col gap-4 p-6 border-b">
          <h4 className="font-semibold">Vote Supply</h4>
          <IconInfo
            icon={<img alt="vote-supply" src="/svgs/vote-supply.svg" />}
            title={t`Current`}
            text={formatCurrency(stats?.voteTokenSupply ?? 0, 0)}
            loading={!stats}
          />
        </div>
        <div className="flex flex-col gap-4 p-6 border-r">
          <h4 className="font-semibold">Voting Addresses</h4>
          <IconInfo
            icon={
              <img alt="voting-addresses" src="/svgs/voting-addresses.svg" />
            }
            title={t`Current`}
            text={formatCurrency(stats?.totalDelegates ?? 0, 0)}
            loading={!stats}
          />
        </div>
        <VotingPower />
      </div>
    </div>
  )
}

export default GovernanceStats
