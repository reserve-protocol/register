import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAtom, useAtomValue } from 'jotai'
import {
  isAuctionOngoingAtom,
  PRICE_VOLATILITY,
  priceVolatilityAtom,
  rebalanceMetricsAtom,
  rebalancePercentAtom,
} from '../atoms'

const RebalanceSlider = () => {
  const [rebalancePercent, setRebalancePercent] = useAtom(rebalancePercentAtom)
  const rebalanceOngoing = useAtomValue(isAuctionOngoingAtom)
  const metrics = useAtomValue(rebalanceMetricsAtom)

  return (
    <Slider
      className="mb-2"
      min={0}
      max={100}
      disabled={rebalanceOngoing}
      value={[rebalancePercent]}
      onValueChange={(value) => {
        if (value[0] > (metrics?.relativeProgression ?? 0)) {
          setRebalancePercent(value[0])
        }
      }}
    />
  )
}

const RebalanceMetrics = () => {
  const metrics = useAtomValue(rebalanceMetricsAtom)

  return (
    <pre className="mt-2 p-3 bg-background rounded-lg text-xs overflow-auto text-foreground">
      {JSON.stringify(metrics, null, 2)}
    </pre>
  )
}

const ExpectedPriceVolatility = () => {
  const [priceVolatility, setPriceVolatility] = useAtom(priceVolatilityAtom)

  return (
    <div className="flex flex-col gap-1 mt-2">
      <label htmlFor="price-volatility" className="text-legend text-sm">
        Expected Price Volatility
      </label>
      <ToggleGroup
        type="single"
        className="bg-muted-foreground/10 p-1 rounded-xl justify-start flex-grow"
        value={priceVolatility}
        onValueChange={(value) => {
          if (value) {
            setPriceVolatility(value)
          }
        }}
      >
        {Object.keys(PRICE_VOLATILITY).map((option) => (
          <ToggleGroupItem
            key={option}
            value={option}
            className="px-5 h-8 whitespace-nowrap rounded-lg data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary flex-grow"
          >
            {option.charAt(0) + option.slice(1).toLowerCase()}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <span className="text-legend text-sm">
        Value: {PRICE_VOLATILITY[priceVolatility]}
      </span>
    </div>
  )
}

const RebalanceDebug = () => {
  return (
    <div className="bg-background p-4 rounded-3xl">
      <div className="flex">
        <div className="w-full">
          <h1 className="text-2xl mb-4 border-b border-secondary pb-2">
            Debug
          </h1>
          <RebalanceSlider />
          <ExpectedPriceVolatility />
          <RebalanceMetrics />
        </div>
      </div>
    </div>
  )
}

export default RebalanceDebug
