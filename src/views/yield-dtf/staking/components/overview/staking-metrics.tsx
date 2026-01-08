import { useAtomValue } from 'jotai'
import { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { stRsrTickerAtom } from '@/views/yield-dtf/staking/atoms'

const ExchangeRate = lazy(() => import('./exchange-rate'))
const StakeHistory = lazy(() => import('./stake-history'))

const ChartSkeleton = () => (
  <div className="h-[254px] flex justify-center items-center">
    <Skeleton className="h-6 w-6 rounded-full" />
  </div>
)

const StakingMetrics = () => {
  const ticker = useAtomValue(stRsrTickerAtom)

  return (
    <div className="rounded-3xl border border-border p-6">
      <Tabs defaultValue="exchange">
        <TabsList className="mb-4">
          <TabsTrigger value="exchange">{ticker}/RSR</TabsTrigger>
          <TabsTrigger value="staked">Staked RSR</TabsTrigger>
        </TabsList>
        <TabsContent value="exchange" className="mt-0">
          <Suspense fallback={<ChartSkeleton />}>
            <ExchangeRate />
          </Suspense>
        </TabsContent>
        <TabsContent value="staked" className="mt-0">
          <Suspense fallback={<ChartSkeleton />}>
            <StakeHistory />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default StakingMetrics
