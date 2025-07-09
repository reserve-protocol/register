import { AuctionRound } from '@reserve-protocol/dtf-rebalance-lib'
import { atom, useAtomValue } from 'jotai'
import {
  activeAuctionAtom,
  rebalanceMetricsAtom,
  rebalanceTokenMapAtom,
} from '../atoms'
import LaunchAuctionsButton from './launch-auctions-button'
import RebalanceActionOverview from './rebalance-action-overview'

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
      <h1 className="text-2xl text-primary">
        {ROUND_TITLE[metrics?.round ?? 0]}
      </h1>
      <p className="text-legend">{description}</p>
    </div>
  )
}

const RebalanceAction = () => {
  const activeAuction = useAtomValue(activeAuctionAtom)

  // Don't show the action component if there's an active auction
  if (activeAuction) {
    return null
  }

  return (
    <div className="bg-background rounded-3xl">
      <RoundDescription />
      <RebalanceActionOverview />
      <LaunchAuctionsButton />
    </div>
  )
}

export default RebalanceAction
