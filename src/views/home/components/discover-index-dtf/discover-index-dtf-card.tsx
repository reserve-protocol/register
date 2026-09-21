import { Trans } from '@lingui/react/macro'
import type { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { formatCurrency } from '@/utils'
import { IndexDTFFeatureCard } from '../highlighted-dtfs/feature-card'

const MarketCapRow = ({ marketCap }: { marketCap: number }) => (
  <div
    className="flex w-full items-center justify-between px-5 py-4 pt-3 text-sm"
    data-feature-card-supporting-row
  >
    <span className="text-legend">
      <Trans>Market Cap:</Trans>
    </span>
    <span className="tabular-nums text-foreground">
      $
      {formatCurrency(marketCap, 0, {
        notation: 'compact',
        compactDisplay: 'short',
      })}
    </span>
  </div>
)

export const DiscoverIndexDTFCard = ({ dtf }: { dtf: IndexDTFItem }) => {
  return (
    <div>
      <IndexDTFFeatureCard
        dtf={dtf}
        chartPlacement="header"
        performanceLabel="1m"
        showTranscript={false}
        bottomSlot={<MarketCapRow marketCap={dtf.marketCap} />}
      />
    </div>
  )
}
