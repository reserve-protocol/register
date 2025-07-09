import { getProposalTitle } from '@/utils'
import { useNavigate } from 'react-router-dom'
import { RebalanceByProposal } from '../../../atoms'
import { MetricsRow } from './metrics-row'
import { RebalanceItemFooter } from './rebalance-item-footer'

interface HistoricalRebalanceItemProps {
  rebalance: RebalanceByProposal
}

export const HistoricalRebalanceItem = ({
  rebalance,
}: HistoricalRebalanceItemProps) => {
  const navigate = useNavigate()

  return (
    <div
      className="bg-card rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 md:w-[706px] cursor-pointer"
      onClick={() => navigate(`rebalance/${rebalance.proposal.id}`)}
    >
      <div className="flex items-center justify-between  p-4 md:p-6 border-b border-secondary">
        <h1 className="text-base md:text-2xl line-clamp-2 mr-auto">
          {getProposalTitle(rebalance.proposal.description)}
        </h1>

        <h2 className="text-base md:text-2xl line-clamp-2 text-legend">
          Completed
        </h2>
      </div>

      <MetricsRow proposalId={rebalance.proposal.id} />
      <RebalanceItemFooter proposal={rebalance.proposal} />
    </div>
  )
}
