import SectionAnchor from '@/components/section-anchor'
import { Trans } from '@lingui/macro'
import { TrendingUp } from 'lucide-react'
import { Suspense, lazy } from 'react'
import Skeleton from 'react-loading-skeleton'

const Charts = lazy(() => import('./charts'))

const HistoricalMetrics = () => (
  <div id="historical-metrics" className="group/section">
    <div className="flex items-center ml-6 mb-4 mt-10 text-primary">
      <TrendingUp />
      <h2 className="mx-2 text-2xl font-semibold">
        <Trans>Historical metrics</Trans>
      </h2>
      <SectionAnchor id="historical-metrics" />
    </div>
    <div className="mt-8 p-1 bg-secondary rounded-3xl">
      <Suspense fallback={<Skeleton count={3} height={160} />}>
        <Charts />
      </Suspense>
    </div>
  </div>
)

export default HistoricalMetrics
