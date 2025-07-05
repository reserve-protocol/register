import { getProposalTitle } from '@/utils'
import { Check, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { RebalanceByProposal } from '../../../atoms'
import { MetricsRow } from './metrics-row'

interface HistoricalRebalanceItemProps {
  rebalance: RebalanceByProposal
}

export const HistoricalRebalanceItem = ({ rebalance }: HistoricalRebalanceItemProps) => {
  const navigate = useNavigate()

  return (
    <div 
      className="bg-card rounded-2xl p-4 md:p-6 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`rebalance/${rebalance.proposal.id}`)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Check className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <h3 className="text-base md:text-lg font-semibold line-clamp-2 flex-1">
            {getProposalTitle(rebalance.proposal.description)}
          </h3>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 shrink-0 ml-4">
          <span className="text-sm text-muted-foreground">Completed</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      <MetricsRow proposalId={rebalance.proposal.id} />
    </div>
  )
}