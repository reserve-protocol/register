import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { t } from '@lingui/macro'
import { atom, useAtomValue } from 'jotai'
import { governanceStatsAtom } from '../atoms'
import { Archive, FileStack, Notebook } from 'lucide-react'
import TokenLogo from '@/components/token-logo'
import { useVotingPower } from '../hooks/use-voting-power'

const VotingPower = () => {
  const votingPower = useVotingPower()
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="flex items-center gap-3 p-6">
      <TokenLogo
        size="lg"
        symbol={dtf?.stToken?.underlying.symbol}
        address={dtf?.stToken?.underlying.address}
        chain={chainId}
      />
      <div className="flex flex-col ">
        <span className="text-legend text-sm">Vote locked</span>
        <span className="font-bold">
          {formatCurrency(votingPower, 1, {
            notation: 'compact',
            compactDisplay: 'short',
          })}{' '}
          ${dtf?.stToken?.token.symbol}
        </span>
      </div>
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
    <div className="border rounded-full border-foreground p-1">{icon}</div>
    <div className="ml-3">
      <div className="flex items-center">
        <span className="text-legend text-sm">{title}</span>
      </div>
      {loading ? <Skeleton className="h-4 w-24" /> : <span>{text}</span>}
    </div>
  </div>
)

const governanceStatsListAtom = atom((get) => {
  const stats = get(governanceStatsAtom)

  return [
    {
      icon: <FileStack size={14} />,
      title: t`Proposals`,
      text: formatCurrency(stats?.proposalCount ?? 0, 0),
    },
    {
      icon: <Archive size={14} />,
      title: t`Vote Supply`,
      text: formatCurrency(stats?.voteTokenSupply ?? 0, 0),
    },
    {
      icon: <Notebook size={14} />,
      title: t`Voting Addresses`,
      text: formatCurrency(stats?.totalDelegates ?? 0, 0),
    },
  ]
})

const GovernanceStats = () => {
  const governanceStatsList = useAtomValue(governanceStatsListAtom)

  return (
    <div className="flex flex-col rounded-3xl bg-background">
      {governanceStatsList.map(({ icon, title, text }) => (
        <div className="flex flex-col gap-4 p-6 border-b" key={title}>
          <IconInfo icon={icon} title={title} text={text} />
        </div>
      ))}
      <VotingPower />
    </div>
  )
}

export default GovernanceStats
