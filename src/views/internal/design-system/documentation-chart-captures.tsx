import { Trans } from '@lingui/react/macro'

import { DocumentationOverviewChart } from './charts/documentation-overview'
import { SourceCompactChart, SourceHomeChart } from './charts/source-small'

export const DocumentationOverviewChartCapture = ({
  family,
}: {
  family: 'candles' | 'line'
}) => (
  <figure className="w-full" data-testid="chart-overview-source-capture">
    <figcaption className="sr-only">
      <Trans>
        Source-faithful rendering of the accepted PHOTON Overview chart.
      </Trans>
    </figcaption>
    <div
      data-testid={
        family === 'line'
          ? 'chart-overview-line-capture'
          : 'chart-overview-candles-capture'
      }
    >
      <DocumentationOverviewChart chartType={family} />
    </div>
  </figure>
)

export const DocumentationHomeChartCapture = () => (
  <figure
    className="w-full max-w-[340px]"
    data-testid="chart-home-source-capture"
  >
    <figcaption className="sr-only">
      <Trans>
        Source-faithful rendering of the accepted PHOTON highlighted DTF Home
        chart.
      </Trans>
    </figcaption>
    <div data-testid="chart-home-owner-capture">
      <SourceHomeChart />
    </div>
  </figure>
)

export const DocumentationDiscoverChartCapture = () => (
  <figure className="h-20 w-36" data-testid="chart-discover-source-capture">
    <figcaption className="sr-only">
      <Trans>
        Source-faithful rendering of the accepted compact Discover performance
        chart.
      </Trans>
    </figcaption>
    <div data-testid="chart-compact-capture">
      <SourceCompactChart />
    </div>
  </figure>
)
