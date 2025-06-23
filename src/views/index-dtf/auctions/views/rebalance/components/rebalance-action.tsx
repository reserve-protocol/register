import { AuctionRound } from '@reserve-protocol/dtf-rebalance-lib'
import { atom, useAtom, useAtomValue } from 'jotai'
import { ArrowRight, MousePointerClick } from 'lucide-react'
import {
  PRICE_VOLATILITY,
  priceVolatilityAtom,
  rebalanceMetricsAtom,
  rebalancePercentAtom,
  rebalanceTokenMapAtom,
} from '../atoms'
import LaunchAuctionsButton from './launch-auctions-button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const ROUND_TITLE = {
  [AuctionRound.EJECT]: 'Remove Tokens',
  [AuctionRound.PROGRESS]: 'Progressing',
  [AuctionRound.FINAL]: 'Precision Rebalancing',
}

const rebalanceDescriptionAtom = atom((get) => {
  const metrics = get(rebalanceMetricsAtom)
  const tokenMap = get(rebalanceTokenMapAtom)

  if (!metrics || !Object.keys(tokenMap).length) return ''

  const formatTokens = (tokens: string[]) => {
    const symbols = tokens.map(
      (token) => tokenMap[token.toLowerCase()]?.symbol || ''
    )
    if (symbols.length <= 3) return symbols.join(', ')
    return `${symbols.slice(0, 3).join(', ')}, +${symbols.length - 3}`
  }

  return `Trade ${formatTokens(metrics.surplusTokens)} for ${formatTokens(metrics.deficitTokens)}`
})

const RoundDescription = () => {
  const description = useAtomValue(rebalanceDescriptionAtom)
  const metrics = useAtomValue(rebalanceMetricsAtom)

  return (
    <div className="mt-6">
      <h1 className="text-2xl">{ROUND_TITLE[metrics?.round ?? 0]}</h1>
      <p className="text-legend">{description}</p>
    </div>
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

const Header = () => {
  const metrics = useAtomValue(rebalanceMetricsAtom)
  const rebalancePercent = useAtomValue(rebalancePercentAtom)

  return (
    <div className="flex">
      <div>
        <h4 className="text-primary flex items-center gap-1">
          <MousePointerClick className="w-4 h-4 text-primary" />
          Round {metrics?.round ?? 0 + 1}
        </h4>
      </div>
      <div className="ml-auto flex items-center flex-shrink-0 gap-1">
        <span className="text-legend">
          {metrics?.relativeProgression.toFixed(2)}%
        </span>
        <ArrowRight className="w-4 h-4 text-primary" />
        <span className="text-primary">{rebalancePercent.toFixed(2)}%</span>
      </div>
    </div>
  )
}

const RebalanceAction = () => (
  <div className="bg-background p-4 rounded-3xl">
    <Header />
    <RoundDescription />
    <ExpectedPriceVolatility />
    <LaunchAuctionsButton />
  </div>
)

export default RebalanceAction
