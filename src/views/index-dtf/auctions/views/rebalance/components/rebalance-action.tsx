import { AuctionRound } from '@reserve-protocol/dtf-rebalance-lib'
import { atom, useAtomValue } from 'jotai'
import { ArrowRight, MousePointerClick } from 'lucide-react'
import {
  rebalanceMetricsAtom,
  rebalancePercentAtom,
  rebalanceTokenMapAtom,
} from '../atoms'
import LaunchAuctionsButton from './launch-auctions-button'

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

  return `${metrics.round === 0 ? 'Remove' : 'Trade'} ${formatTokens(metrics.deficitTokens)} for ${formatTokens(metrics.surplusTokens)}`
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
    <LaunchAuctionsButton />
  </div>
)

export default RebalanceAction
