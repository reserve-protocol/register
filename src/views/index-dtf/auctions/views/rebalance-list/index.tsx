import { Skeleton } from '@/components/ui/skeleton'
import { getCurrentTime } from '@/utils'
import { atom, useAtomValue } from 'jotai'
import { rebalancesByProposalListAtom } from '../../atoms'
import {
  ActiveRebalanceItem,
  HistoricalRebalanceItem,
  SectionHeader,
} from './components'
import { dtfTradesAtom } from '../../legacy/atoms'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

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

  return { activeRebalances, historicalRebalances, isLoading: false }
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

const LegacyTradesButton = () => {
  const legacyTrades = useAtomValue(dtfTradesAtom)

  if (legacyTrades?.length === 0) return null

  return (
    <div className="flex justify-center my-6">
      <Link to="./legacy">
        <Button variant="outline-primary" className="rounded-full">
          View older auctions
        </Button>
      </Link>
    </div>
  )
}

const RebalanceList = () => {
  const { isLoading, activeRebalances, historicalRebalances } =
    useAtomValue(rebalanceListAtom)

  return (
    <div className="w-full space-y-6 md:space-y-8 px-0 sm:px-2 lg:px-4 md:px-0 md:w-[706px]">
      <section className="pt-6">
        <SectionHeader
          color="primary"
          title="Active Rebalances"
          count={activeRebalances.length}
          isLoading={isLoading}
        />

        <div className="space-y-1 lg:space-y-4 bg-secondary p-1 rounded-3xl">
          {isLoading && <LoadingState />}
          {!isLoading && activeRebalances.length === 0 && <EmptyState />}

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

        <div className="space-y-1 lg:space-y-4 bg-secondary p-1 rounded-3xl">
          {isLoading && <LoadingState />}
          {!isLoading && historicalRebalances.length === 0 && <EmptyState />}

          {historicalRebalances.map((rebalance) => (
            <HistoricalRebalanceItem
              key={rebalance.proposal.id}
              rebalance={rebalance}
            />
          ))}
        </div>
        <LegacyTradesButton />
      </section>
    </div>
  )
}

export default RebalanceList
