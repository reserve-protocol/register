import EnsName from '@/components/utils/ens-name'
import { chainIdAtom } from '@/state/atoms'
import { formatDate } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import type { IndexDtfProposalSummary } from '@reserve-protocol/react-sdk'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'

export const RebalanceItemFooter = ({
  proposal,
}: {
  proposal: IndexDtfProposalSummary
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const proposedAt = formatDate(proposal.creationTime * 1000)

  return (
    <div className="flex items-center gap-2 border-t border-secondary p-4 md:p-6">
      <div className="flex items-center gap-1 text-sm mr-auto">
        <span className="text-legend">
          <Trans>Proposed:</Trans>
        </span>
        <Link
          onClick={(e) => e.stopPropagation()}
          to={getExplorerLink(
            proposal.proposer,
            chainId,
            ExplorerDataType.ADDRESS
          )}
          className="underline"
          target="_blank"
        >
          {proposedAt}
        </Link>
      </div>
      <div className="items-center gap-1 text-sm hidden sm:flex">
        <span className="text-legend">
          <Trans>Proposed by:</Trans>
        </span>
        <Link
          onClick={(e) => e.stopPropagation()}
          to={getExplorerLink(
            proposal.proposer,
            chainId,
            ExplorerDataType.ADDRESS
          )}
          target="_blank"
        >
          <EnsName address={proposal.proposer} />
        </Link>
      </div>
    </div>
  )
}
