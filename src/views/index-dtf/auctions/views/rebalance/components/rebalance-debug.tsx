import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { devModeAtom } from '@/state/atoms'
import { formatPercentage } from '@/utils'
import { useAtom, useAtomValue } from 'jotai'
import { ChevronsUpDown } from 'lucide-react'
import { JsonView } from 'react-json-view-lite'
import {
  isAuctionOngoingAtom,
  PRICE_VOLATILITY,
  priceVolatilityAtom,
  rebalanceMetricsAtom,
  rebalancePercentAtom,
} from '../atoms'
import useRebalanceParams from '../hooks/use-rebalance-params'

const RebalanceSlider = () => {
  const [rebalancePercent, setRebalancePercent] = useAtom(rebalancePercentAtom)
  const rebalanceOngoing = useAtomValue(isAuctionOngoingAtom)
  const metrics = useAtomValue(rebalanceMetricsAtom)

  return (
    <div className="flex flex-col gap-1 mt-2">
      <h4 className="text-primary text-xl mb-2">
        Rebalance Percent: {rebalancePercent}%
      </h4>
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
    </div>
  )
}

const RebalanceMetrics = () => {
  const metrics = useAtomValue(rebalanceMetricsAtom)

  return (
    <div className="flex flex-col gap-1 mt-2">
      <Collapsible>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer hover:text-primary/80 transition-colors">
            <h4 className="text-primary text-xl">Metrics</h4>
            <ChevronsUpDown className="h-4 w-4 text-primary transition-transform duration-200 data-[state=open]:rotate-180" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <pre className="mt-2 bg-background rounded-lg text-xs overflow-auto text-foreground">
            <JsonView data={metrics ?? {}} shouldExpandNode={(data) => !data} />
          </pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

const ExpectedPriceVolatility = () => {
  const [priceVolatility, setPriceVolatility] = useAtom(priceVolatilityAtom)

  return (
    <div className="flex flex-col gap-1 mt-2">
      <label htmlFor="price-volatility" className="text-primary text-xl mb-2">
        Expected Price Volatility:{' '}
        {formatPercentage(PRICE_VOLATILITY[priceVolatility] * 100)}
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
    </div>
  )
}

const RebalanceParameters = () => {
  const params = useRebalanceParams()

  return (
    <div className="flex flex-col gap-1 mt-2">
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 w-full">
          <h4 className="text-primary text-xl">Parameters</h4>
          <ChevronsUpDown className="h-4 w-4 text-primary transition-transform duration-200 data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <pre className="mt-2 bg-background rounded-lg text-xs overflow-auto text-foreground">
            <JsonView data={params ?? {}} shouldExpandNode={(data) => !data} />
          </pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

const RebalanceDebug = () => {
  const isDevMode = useAtomValue(devModeAtom)

  // Don't show debug UI if not in dev mode
  if (!isDevMode) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 bg-background p-4 rounded-3xl">
      <RebalanceSlider />
      <ExpectedPriceVolatility />
      <RebalanceMetrics />
      <RebalanceParameters />
    </div>
  )
}

export default RebalanceDebug
