import Spinner from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { getCurrentTime, getProposalTitle } from '@/utils'
import { useAtomValue } from 'jotai'
import { ChevronRight, Folder } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RebalanceByProposal, rebalancesByProposalListAtom } from '../../atoms'
import { ROUTES } from '@/utils/constants'

const RebalanceListItem = ({
  rebalance,
}: {
  rebalance: RebalanceByProposal
}) => {
  const isActive = +rebalance.rebalance.availableUntil > getCurrentTime()

  return (
    <Link
      to={`rebalance/${rebalance.proposal.id}`}
      className={cn('p-4 flex items-center gap-2 border-b last:border-b-0')}
    >
      <div
        className={cn(
          'h-8 w-8 flex items-center justify-center rounded-full',
          isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isActive ? <Spinner size={16} /> : <Folder size={16} />}
      </div>
      <div>
        <Link
          target="_blank"
          to={`../${ROUTES.GOVERNANCE_PROPOSAL}/${rebalance.proposal.id}`}
          className={cn(
            'underline hover:text-primary',
            isActive && 'text-primary'
          )}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {getProposalTitle(rebalance.proposal.description)}
        </Link>
      </div>
      <div
        className={cn(
          'ml-auto bg-muted rounded-full border border-transparent p-2 text-legend',
          isActive && 'border-primary bg-transparent text-primary'
        )}
      >
        <ChevronRight size={16} />
      </div>
    </Link>
  )
}

const RebalanceList = () => {
  const rebalances = useAtomValue(rebalancesByProposalListAtom) ?? []

  return (
    <div className="rounded-3xl bg-secondary p-1 max-w-full w-[480px]">
      <div className="bg-background rounded-2xl">
        <h1 className="text-xl font-semibold p-2 ml-2 pt-5">Rebalances</h1>
        <div className="flex flex-col gap-1">
          {rebalances.map((rebalance) => (
            <RebalanceListItem
              key={rebalance.proposal.id}
              rebalance={rebalance}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default RebalanceList
