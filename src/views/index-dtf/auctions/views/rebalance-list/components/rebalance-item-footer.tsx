import { PartialProposal } from '@/lib/governance'
import { chainIdAtom } from '@/state/atoms'
import { formatDate, shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'

export const RebalanceItemFooter = ({
  proposal,
}: {
  proposal: PartialProposal
}) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="flex items-center gap-2 border-t border-secondary p-4 md:p-6">
      <div className="flex items-center gap-1 text-sm mr-auto">
        <span className="text-legend">Proposed:</span>
        <Link
          onClick={(e) => e.stopPropagation()}
          to={getExplorerLink(
            proposal.proposer.address,
            chainId,
            ExplorerDataType.ADDRESS
          )}
          className="underline"
          target="_blank"
        >
          {formatDate(proposal.creationTime * 1000)}
        </Link>
      </div>
      <div className="flex items-center gap-1 text-sm">
        <span className="text-legend">Proposed by:</span>
        <Link
          onClick={(e) => e.stopPropagation()}
          to={getExplorerLink(
            proposal.proposer.address,
            chainId,
            ExplorerDataType.ADDRESS
          )}
          target="_blank"
        >
          {shortenAddress(proposal.proposer.address)}
        </Link>
      </div>
    </div>
  )
}
