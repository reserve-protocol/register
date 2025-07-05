import useTimeRemaining from '@/hooks/use-time-remaining'
import {
  formatDate,
  getCurrentTime,
  getProposalTitle,
  shortenAddress,
} from '@/utils'
import { ArrowRight, MousePointerBan, MousePointerClick } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { RebalanceByProposal } from '../../../atoms'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { chainIdAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'

interface ActiveRebalanceItemProps {
  rebalance: RebalanceByProposal
  index: number
}

export const ActiveRebalanceItem = ({
  rebalance,
  index,
}: ActiveRebalanceItemProps) => {
  const navigate = useNavigate()
  const chainId = useAtomValue(chainIdAtom)

  const restrictedUntil = +rebalance.rebalance.restrictedUntil
  const availableUntil = +rebalance.rebalance.availableUntil

  const currentTime = getCurrentTime()
  const isPermissionless = currentTime > restrictedUntil

  const permissionlessTimeRemaining = useTimeRemaining(restrictedUntil)
  const expiryTimeRemaining = useTimeRemaining(availableUntil)

  return (
    <div
      className="bg-card rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300"
      role="button"
      onClick={() => navigate(`rebalance/${rebalance.proposal.id}`)}
    >
      <div className="flex items-center gap-3 md:gap-4 flex-1 p-4 md:p-6">
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mr-auto">
          <MousePointerClick className="h-4 w-4" />
        </div>

        {!isPermissionless && (
          <div className="flex items-center gap-1 text-sm  border-r pr-4">
            <MousePointerClick
              className="h-4 w-4 text-base"
              strokeWidth={1.5}
            />
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
      <div className="flex items-center gap-2 md:p-6 p-4">
        <h1 className="text-base md:text-2xl text-primary line-clamp-2 mr-auto">
          {getProposalTitle(rebalance.proposal.description)}
        </h1>
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 ">
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-secondary p-4 md:p-6">
        <div className="flex items-center gap-1 text-sm mr-auto">
          <span className="text-legend">Proposed:</span>
          <Link
            onClick={(e) => e.stopPropagation()}
            to={getExplorerLink(
              rebalance.proposal.proposer.address,
              chainId,
              ExplorerDataType.ADDRESS
            )}
            className="underline"
            target="_blank"
          >
            {formatDate(rebalance.proposal.creationTime * 1000)}
          </Link>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-legend">Proposed by:</span>
          <Link
            onClick={(e) => e.stopPropagation()}
            to={getExplorerLink(
              rebalance.proposal.proposer.address,
              chainId,
              ExplorerDataType.ADDRESS
            )}
            target="_blank"
          >
            {shortenAddress(rebalance.proposal.proposer.address)}
          </Link>
        </div>
      </div>
    </div>
  )
}
