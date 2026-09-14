import { ChainBadgedLogo } from '@/components/entity-identity'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import { PERFORMANCE_TEXT_CLASSES } from '@/utils/chart-performance-colors'
import { PerformanceChart } from '@/views/home/components/highlighted-dtfs/performance-chart'
import { Line, LineChart, YAxis } from 'recharts'
import { chartSample } from './fixtures'
import { trendDomain } from '../table-family/discover-fixtures'
import { homePoints, launchTimestamp, photon } from './source-data'

const compactPoints = chartSample('1M', 'captured').points

export function SourceCompactChart() {
  return (
    <div
      data-testid="chart-compact"
      className="flex h-20 w-36 items-center justify-center bg-card"
    >
      <div
        data-testid="chart-plot"
        role="img"
        aria-label="Captured LCAP 30-day trend"
        className={cn('h-10 w-[90px]', PERFORMANCE_TEXT_CLASSES.positive)}
      >
        <LineChart
          width={90}
          height={40}
          data={compactPoints}
          margin={{ top: 3, right: 2, bottom: 3, left: 2 }}
          accessibilityLayer={false}
        >
          <YAxis hide domain={trendDomain} />
          <Line
            type="linear"
            dataKey="value"
            stroke="currentColor"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </div>
    </div>
  )
}

export function SourceHomeChart() {
  return (
    <div
      data-testid="chart-card"
      className={cn('w-full max-w-[340px] p-2', roles.surface.content)}
    >
      <div
        data-testid="chart-home-media"
        className="flex flex-col overflow-hidden rounded-lg bg-gradient-to-b from-secondary to-card"
      >
        <div className="flex min-w-0 flex-col gap-4 p-4">
          <ChainBadgedLogo
            address={photon.address}
            chain={photon.chainId}
            symbol={photon.symbol}
            size="xl"
            surface="structural"
            className="self-start"
          />
          <div className="w-full min-w-0 space-y-2">
            <h3
              className={cn(
                'min-w-0 break-words',
                type.panelTitle,
                roles.text.primary
              )}
            >
              {photon.name}
            </h3>
            <div
              className={cn(
                'flex w-full min-w-0 items-center justify-between gap-3',
                type.body,
                roles.text.supporting
              )}
              data-testid="chart-home-market-row"
            >
              <span className="truncate">
                <span className="text-foreground tabular-nums">
                  ${formatCurrency(photon.homePrice, 2)}
                </span>
                <span> · ${photon.symbol}</span>
              </span>
              <span
                className={cn(
                  'shrink-0 tabular-nums',
                  PERFORMANCE_TEXT_CLASSES.positive
                )}
              >
                +{photon.homeChange.toFixed(2)}% ({photon.homePeriod})
              </span>
            </div>
          </div>
        </div>
        <div data-testid="chart-home-plot">
          <PerformanceChart
            chartKey="lab-source-photon"
            className="h-52"
            direction="positive"
            performance={homePoints}
            launchTimestamp={launchTimestamp}
            launchMarkerToken={{
              address: photon.address,
              chainId: photon.chainId,
              symbol: photon.symbol,
            }}
            useLaunchLabel
            animate={false}
            fadeClassName="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-card/0 to-card"
          />
        </div>
      </div>
    </div>
  )
}
