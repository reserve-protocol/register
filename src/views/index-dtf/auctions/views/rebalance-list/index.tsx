import { useAtomValue } from 'jotai'
import { RebalanceByProposal, rebalancesByProposalListAtom } from '../../atoms'
import { getCurrentTime, getProposalTitle } from '@/utils'
import { Link } from 'react-router-dom'

const RebalanceListItem = ({
  rebalance,
}: {
  rebalance: RebalanceByProposal
}) => {
  const isActive = +rebalance.rebalance.availableUntil > getCurrentTime()

  return (
    <Link
      to={`rebalance/${rebalance.proposal.id}`}
      className="p-4 bg-background rounded-3xl flex items-center gap-2"
    >
      <div>
        <Link
          to={`/proposal/${rebalance.proposal.id}`}
          className="underline hover:text-primary"
        >
          {getProposalTitle(rebalance.proposal.description)}
        </Link>
      </div>
      <div className="ml-auto border rounded-4xl px-2 py-1">
        {isActive ? (
          <span className="text-green-500">Active</span>
        ) : (
          <span className="text-red-500">Inactive</span>
        )}
      </div>
    </Link>
  )
}

const RebalanceList = () => {
  const rebalances = useAtomValue(rebalancesByProposalListAtom) ?? []

  return (
    <div className="rounded-3xl bg-secondary p-1 max-w-full w-[480px]">
      <h1 className="text-xl font-semibold p-2">Rebalances</h1>
      {rebalances.map((rebalance) => (
        <RebalanceListItem key={rebalance.proposal.id} rebalance={rebalance} />
      ))}
    </div>
  )
}

export default RebalanceList
