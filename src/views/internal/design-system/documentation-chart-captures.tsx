import { Trans } from '@lingui/react/macro'

import discoverChartDark from './assets/patterns/discover-chart-dark.png'
import discoverChartLight from './assets/patterns/discover-chart-light.png'
import homeChartDark from './assets/patterns/home-chart-dark.png'
import homeChartLight from './assets/patterns/home-chart-light.png'
import overviewCandlesDark from './assets/patterns/overview-candles-dark.png'
import overviewCandlesLight from './assets/patterns/overview-candles-light.png'
import overviewLineDark from './assets/patterns/overview-line-dark.png'
import overviewLineLight from './assets/patterns/overview-line-light.png'

const ExactCapture = ({
  dark,
  height,
  light,
  testId,
  width,
}: {
  dark: string
  height: number
  light: string
  testId: string
  width: number
}) => (
  <picture data-testid={testId}>
    <img
      alt=""
      className="block h-auto w-full dark:hidden"
      height={height}
      src={light}
      width={width}
    />
    <img
      alt=""
      className="hidden h-auto w-full dark:block"
      height={height}
      src={dark}
      width={width}
    />
  </picture>
)

export const DocumentationOverviewChartCapture = ({
  family,
}: {
  family: 'candles' | 'line'
}) => (
  <figure className="w-full" data-testid="chart-overview-source-capture">
    <figcaption className="sr-only">
      <Trans>Exact source capture of the accepted PHOTON Overview chart.</Trans>
    </figcaption>
    <ExactCapture
      dark={family === 'line' ? overviewLineDark : overviewCandlesDark}
      height={522}
      light={family === 'line' ? overviewLineLight : overviewCandlesLight}
      testId={
        family === 'line'
          ? 'chart-overview-line-capture'
          : 'chart-overview-candles-capture'
      }
      width={824}
    />
  </figure>
)

export const DocumentationHomeChartCapture = () => (
  <figure
    className="w-full max-w-[340px]"
    data-testid="chart-home-source-capture"
  >
    <figcaption className="sr-only">
      <Trans>
        Exact source capture of the accepted PHOTON highlighted DTF Home chart.
      </Trans>
    </figcaption>
    <ExactCapture
      dark={homeChartDark}
      height={362}
      light={homeChartLight}
      testId="chart-home-owner-capture"
      width={340}
    />
  </figure>
)

export const DocumentationDiscoverChartCapture = () => (
  <figure className="h-20 w-36" data-testid="chart-discover-source-capture">
    <figcaption className="sr-only">
      <Trans>
        Exact source capture of the accepted compact Discover performance chart.
      </Trans>
    </figcaption>
    <ExactCapture
      dark={discoverChartDark}
      height={80}
      light={discoverChartLight}
      testId="chart-compact-capture"
      width={144}
    />
  </figure>
)
