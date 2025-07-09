import useTimeRemaining from '@/hooks/use-time-remaining'
import { getCurrentTime, getProposalTitle } from '@/utils'
import { ArrowRight, MousePointerBan, MousePointerClick } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { RebalanceByProposal } from '../../../atoms'
import { RebalanceItemFooter } from './rebalance-item-footer'

interface ActiveRebalanceItemProps {
  rebalance: RebalanceByProposal
}

const Header = ({
  restrictedUntil,
  availableUntil,
}: {
  restrictedUntil: number
  availableUntil: number
}) => {
  const currentTime = getCurrentTime()
  const isPermissionless = currentTime > restrictedUntil
  const permissionlessTimeRemaining = useTimeRemaining(restrictedUntil)
  const expiryTimeRemaining = useTimeRemaining(availableUntil)

  return (
    <div className="flex items-center gap-3 md:gap-4 flex-1 p-4 md:p-6">
      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mr-auto">
        <MousePointerClick className="h-4 w-4" />
      </div>

      {!isPermissionless && (
        <div className="flex items-center gap-1 text-sm  border-r pr-4">
          <MousePointerClick className="h-4 w-4 text-base" strokeWidth={1.5} />
          <span className="text-legend">Permissionless in:</span>
          <span>{permissionlessTimeRemaining}</span>
        </div>
      )}

      <div className="flex items-center gap-1 text-sm">
        <MousePointerBan className="h-4 w-4 text-base" strokeWidth={1.5} />
        <span className="text-legend">Expires in:</span>
        <span>{expiryTimeRemaining}</span>
      </div>
    </div>
  )
}

const Title = ({ title }: { title: string }) => {
  return (
    <div className="flex items-center gap-2 md:p-6 p-4">
      <h1 className="text-base md:text-2xl text-primary line-clamp-2 mr-auto">
        {getProposalTitle(title)}
      </h1>
      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 ">
        <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  )
}

const ActiveRebalanceItem = ({ rebalance }: ActiveRebalanceItemProps) => {
  const navigate = useNavigate()

  return (
    <div
      className="bg-card rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 md:w-[706px] cursor-pointer"
      role="button"
      onClick={() => navigate(`rebalance/${rebalance.proposal.id}`)}
    >
      <Header
        restrictedUntil={+rebalance.rebalance.restrictedUntil}
        availableUntil={+rebalance.rebalance.availableUntil}
      />
      <Title title={rebalance.proposal.description} />
      <RebalanceItemFooter proposal={rebalance.proposal} />
    </div>
  )
}

export default ActiveRebalanceItem
