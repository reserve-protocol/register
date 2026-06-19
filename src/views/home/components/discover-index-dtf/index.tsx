import IndexDTFTable from './index-dtf-table'
import useFilteredDTFIndex from '../../hooks/use-filtered-index-dtf'
import {
  CollateralAssetAnimationStyles,
  IndexDTFFeatureCard,
  IndexDTFFeatureCardPlaceholder,
} from '../highlighted-dtfs'
import { formatCurrency } from '@/utils'
import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { Trans } from '@lingui/react/macro'

const MarketCapRow = ({ marketCap }: { marketCap: number }) => (
  <div className="flex w-full items-center justify-between px-5 py-4 pt-3 text-sm">
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

const DiscoverIndexDTFCard = ({ dtf }: { dtf: IndexDTFItem }) => {
  return (
    <div>
      <IndexDTFFeatureCard
        dtf={dtf}
        chartPlacement="header"
        performanceLabel="7d"
        showTranscript={false}
        bottomSlot={<MarketCapRow marketCap={dtf.marketCap} />}
      />
    </div>
  )
}

const DiscoverIndexDTF = () => {
  const { data, isLoading } = useFilteredDTFIndex()

  return (
    <>
      <div className="overflow-auto hidden lg:block">
        <IndexDTFTable data={data} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:hidden">
        <CollateralAssetAnimationStyles />
        {isLoading ? (
          <IndexDTFFeatureCardPlaceholder
            chartPlacement="header"
            showTranscript={false}
          />
        ) : (
          data.map((dtf) => (
            <DiscoverIndexDTFCard
              key={`${dtf.chainId}-${dtf.address}`}
              dtf={dtf}
            />
          ))
        )}
      </div>
    </>
  )
}

export default DiscoverIndexDTF
