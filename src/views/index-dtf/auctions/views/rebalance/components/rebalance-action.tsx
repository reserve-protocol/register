import { AuctionRound } from '@reserve-protocol/dtf-rebalance-lib'
import { atom, useAtomValue } from 'jotai'
import { ArrowLeftRight, ArrowRight, MousePointerClick } from 'lucide-react'
import {
  rebalanceMetricsAtom,
  rebalancePercentAtom,
  rebalanceTokenMapAtom,
} from '../atoms'
import LaunchAuctionsButton from './launch-auctions-button'
import DecimalDisplay from '@/components/decimal-display'

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
    <div className="p-4 md:p-6">
      <h1 className="text-2xl">{ROUND_TITLE[metrics?.round ?? 0]}</h1>
      <p className="text-legend">{description}</p>
    </div>
  )
}

const Header = () => {
  const metrics = useAtomValue(rebalanceMetricsAtom)
  const rebalancePercent = useAtomValue(rebalancePercentAtom)

  return (
    <div className="flex p-4 md:p-6 pb-0 md:pb-2">
      <div
        className={
          'h-8 w-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground'
        }
      >
        <ArrowLeftRight className="w-4 h-4" />
      </div>
      <div className="ml-auto flex items-center flex-shrink-0 gap-1">
        <span className="text-legend text-sm">To trade:</span>
        <span>
          $<DecimalDisplay value={metrics?.auctionSize ?? 0} decimals={0} />
        </span>
      </div>
    </div>
  )
}

const RebalanceAction = () => (
  <div className="bg-background p-2 rounded-3xl">
    <Header />
    <RoundDescription />
    <LaunchAuctionsButton />
  </div>
)

export default RebalanceAction
