import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getCurrentTime, getProposalTitle } from '@/utils'
import { atom, useAtomValue } from 'jotai'
import { ArrowLeft, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { currentRebalanceAtom } from '../../../atoms'
import { ROUTES } from '@/utils/constants'
import useTimeRemaining from '@/hooks/use-time-remaining'
import { rebalanceMetricsAtom, rebalanceTokenMapAtom } from '../atoms'

const TimeRemaining = () => {
  const rebalance = useAtomValue(currentRebalanceAtom)

  const timeRemaining = useTimeRemaining(
    rebalance?.rebalance.availableUntil
      ? +rebalance.rebalance.availableUntil
      : undefined
  )

  if (!timeRemaining) return null

  return (
    <div className="ml-auto flex items-center bg-muted gap-2 p-2 rounded-full">
      <Clock className="w-4 h-4 text-legend" />
      <span className="  text-xs font-medium text-legend">{timeRemaining}</span>
    </div>
  )
}

const RebalanceHeader = () => {
  const rebalance = useAtomValue(currentRebalanceAtom)

  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <Link to={`../`}>
        <Button variant="muted" size="icon-rounded">
          <ArrowLeft />
        </Button>
      </Link>
      <div>
        <h4 className="text-legend text-sm">Rebalance proposal</h4>
        {!!rebalance ? (
          <Link
            to={`../../${ROUTES.GOVERNANCE_PROPOSAL}/${rebalance?.proposal.id}`}
            target="_blank"
            className="underline"
          >
            {getProposalTitle(rebalance.proposal.description)}
          </Link>
        ) : (
          <Skeleton className="w-24 h-6" />
        )}
      </div>
      <TimeRemaining />
    </div>
  )
}

export default RebalanceHeader
