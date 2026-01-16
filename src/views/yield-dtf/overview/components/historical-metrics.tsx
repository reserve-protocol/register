import { Trans } from '@lingui/macro'
import { TrendingUp } from 'lucide-react'
import { Suspense, lazy } from 'react'
import Skeleton from 'react-loading-skeleton'

const Charts = lazy(() => import('./charts'))

const HistoricalMetrics = () => (
  <div>
    <div className="flex items-center ml-6 mb-4 mt-10 text-primary">
      <TrendingUp />
      <h2 className="ml-4 text-2xl font-semibold">
        <Trans>Historical metrics</Trans>
      </h2>
    </div>
    <div className="mt-8 p-1 bg-secondary rounded-3xl">
      <Suspense fallback={<Skeleton count={3} height={160} />}>
        <Charts />
      </Suspense>
    </div>
  </div>
)

export default HistoricalMetrics
