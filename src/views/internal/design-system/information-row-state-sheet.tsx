import { EntityIdentity } from '@/components/entity-identity'
import { MetricValue } from '@/components/metric'
import TokenLogo from '@/components/token-logo'
import { PERFORMANCE_TEXT_CLASSES } from '@/utils/chart-performance-colors'
import { ChainId } from '@/utils/chains'

const ROWS = [
  {
    name: 'Bitcoin',
    symbol: '$BTC',
    logo: '/svgs/wbtc.svg',
    weight: '71.00%',
    performance: '+12.40%',
    marketCap: '$1.46T',
    direction: 'positive' as const,
  },
  {
    name: 'Wrapped liquid staked Ether 2.0',
    symbol: '$WSTETH · 2 sources',
    logo: '/svgs/weth.svg',
    weight: '12.70%',
    performance: '−36.43%',
    marketCap: '$43.8B',
    direction: 'negative' as const,
  },
  {
    name: 'Unlisted collateral',
    symbol: '$UNLISTED',
    weight: '1.25%',
    performance: '—',
    marketCap: '—',
    direction: 'neutral' as const,
  },
]

const InformationRowStateSheet = () => (
  <section
    data-testid="information-row-state-sheet"
    className="space-y-4"
    aria-labelledby="information-row-state-sheet-title"
  >
    <div>
      <h2
        id="information-row-state-sheet-title"
        className="text-xl font-medium"
      >
        Canonical anatomy in context
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        A realistic Index holdings slice using the canonical Entity identity and
        Metric value seams. The table owns columns and row behavior; neither
        lower-level component becomes a universal row.
      </p>
    </div>

    <div
      className="overflow-hidden bg-card"
      data-testid="canonical-index-data-slice"
    >
      <div className="grid grid-cols-[minmax(14rem,1fr)_5.5rem_7rem_6.5rem] items-center gap-4 px-6 py-3 text-sm font-light text-muted-foreground">
        <span>Exposure</span>
        <span className="text-right">Weight</span>
        <span className="text-right">30d change</span>
        <span className="text-right">Market cap</span>
      </div>
      <div className="px-6 pb-6">
        {ROWS.map((row) => (
          <div
            key={row.symbol}
            className="grid min-h-16 grid-cols-[minmax(14rem,1fr)_5.5rem_7rem_6.5rem] items-center gap-4"
          >
            <EntityIdentity
              className="max-w-full"
              mark={
                <TokenLogo
                  src={row.logo}
                  symbol={row.symbol.slice(1)}
                  size="xl"
                  chain={ChainId.BSC}
                  alt={row.name}
                />
              }
              name={row.name}
              supporting={row.symbol}
            />
            <MetricValue align="end">{row.weight}</MetricValue>
            <MetricValue
              align="end"
              className={
                row.direction === 'positive'
                  ? PERFORMANCE_TEXT_CLASSES.positive
                  : row.direction === 'negative'
                    ? PERFORMANCE_TEXT_CLASSES.negative
                    : 'text-muted-foreground'
              }
            >
              {row.performance}
            </MetricValue>
            <MetricValue align="end">{row.marketCap}</MetricValue>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default InformationRowStateSheet
