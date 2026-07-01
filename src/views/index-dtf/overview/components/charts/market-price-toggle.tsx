import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { isYieldIndexDTFAtom } from '@/state/dtf/yield-index-atoms'
import { useLingui } from '@lingui/react/macro'
import { useAtom, useAtomValue } from 'jotai'
import {
  chartTypeAtom,
  dataTypeAtom,
  marketPriceInfoAtom,
  showMarketPriceAtom,
} from './price-chart-atoms'

const MarketPriceToggle = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const [showMarketPrice, setShowMarketPrice] = useAtom(showMarketPriceAtom)
  const { hasData } = useAtomValue(marketPriceInfoAtom)
  const chartType = useAtomValue(chartTypeAtom)
  const dataType = useAtomValue(dataTypeAtom)
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)

  // Market overlay only applies to the standard NAV (price) line chart.
  if (
    !hasData ||
    chartType !== 'line' ||
    dataType !== 'price' ||
    isYieldIndexDTF
  ) {
    return null
  }

  const label = t`Market Price`

  return (
    <div className={cn('flex bg-white/10 rounded-full p-1 w-fit', className)}>
      <Button
        variant="ghost"
        aria-pressed={showMarketPrice}
        title={label}
        className={cn(
          'h-6 px-2 text-xs sm:text-sm text-white/80 rounded-full hover:bg-white hover:text-black',
          showMarketPrice && 'bg-white text-black hover:bg-white'
        )}
        onClick={() => setShowMarketPrice((previous) => !previous)}
      >
        {label}
      </Button>
    </div>
  )
}

export default MarketPriceToggle
