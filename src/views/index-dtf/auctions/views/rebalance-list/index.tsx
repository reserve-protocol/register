import { getCurrentTime } from '@/utils'
import { useAtomValue } from 'jotai'
import { rebalancesByProposalListAtom } from '../../atoms'
import {
  ActiveRebalanceItem,
  HistoricalRebalanceItem,
  SectionHeader,
  EmptyState,
  LoadingState,
} from './components'

const RebalanceList = () => {
  const rebalances = useAtomValue(rebalancesByProposalListAtom)

  // Show loading state if data hasn't been fetched yet
  if (rebalances === undefined) {
    return <LoadingState />
  }

  // Separate active and historical rebalances
  const activeRebalances = rebalances.filter(
    (r) => +r.rebalance.availableUntil > getCurrentTime()
  )
  const historicalRebalances = rebalances.filter(
    (r) => +r.rebalance.availableUntil <= getCurrentTime()
  )

  // Show empty state if no rebalances
  if (rebalances.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 md:px-0">
      {/* Active Rebalances Section */}
      {activeRebalances.length > 0 && (
        <section>
          <SectionHeader
            color="primary"
            title="Active Rebalances"
            count={activeRebalances.length}
          />

          <div className="space-y-4">
            {activeRebalances.map((rebalance, index) => (
              <ActiveRebalanceItem
                key={rebalance.proposal.id}
                rebalance={rebalance}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* Historical Rebalances Section */}
      {historicalRebalances.length > 0 && (
        <section>
          <SectionHeader
            title="Historical Rebalances"
            count={historicalRebalances.length}
          />

          <div className="space-y-4">
            {historicalRebalances.map((rebalance) => (
              <HistoricalRebalanceItem
                key={rebalance.proposal.id}
                rebalance={rebalance}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default RebalanceList
