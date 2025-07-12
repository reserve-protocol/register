import { Skeleton } from '@/components/ui/skeleton'
import { getCurrentTime } from '@/utils'
import { atom, useAtomValue } from 'jotai'
import { rebalancesByProposalListAtom } from '../../atoms'
import {
  ActiveRebalanceItem,
  HistoricalRebalanceItem,
  SectionHeader,
} from './components'

const rebalanceListAtom = atom((get) => {
  const rebalances = get(rebalancesByProposalListAtom)

  if (!rebalances)
    return { isLoading: true, activeRebalances: [], historicalRebalances: [] }

  // Separate active and historical rebalances
  const activeRebalances = rebalances.filter(
    (r) => +r.rebalance.availableUntil > getCurrentTime()
  )
  const historicalRebalances = rebalances.filter(
    (r) => +r.rebalance.availableUntil <= getCurrentTime()
  )

  return { activeRebalances, historicalRebalances, isLoading: true }
})

const EmptyState = () => {
  return (
    <div className="h-52 bg-background rounded-3xl p-1">
      <div className="bg-secondary/70 w-full h-full flex flex-col items-center justify-center rounded-3xl">
        <h1 className="text-xl text-legend">No rebalances found</h1>
      </div>
    </div>
  )
}

const LoadingState = () => {
  return <Skeleton className="h-52 bg-background rounded-3xl " />
}

const RebalanceList = () => {
  const { isLoading, activeRebalances, historicalRebalances } =
    useAtomValue(rebalanceListAtom)

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 md:px-0 md:w-[706px]">
      <section>
        <SectionHeader
          color="primary"
          title="Active Rebalances"
          count={activeRebalances.length}
          isLoading={isLoading}
        />

        {isLoading && <LoadingState />}
        {!isLoading && activeRebalances.length === 0 && <EmptyState />}

        <div className="space-y-4">
          {activeRebalances.map((rebalance, index) => (
            <ActiveRebalanceItem
              key={rebalance.proposal.id}
              rebalance={rebalance}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Historical Rebalances"
          count={historicalRebalances.length}
          isLoading={isLoading}
        />

        {isLoading && <LoadingState />}
        {!isLoading && historicalRebalances.length === 0 && <EmptyState />}

        <div className="space-y-4">
          {historicalRebalances.map((rebalance) => (
            <HistoricalRebalanceItem
              key={rebalance.proposal.id}
              rebalance={rebalance}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default RebalanceList
