import { isAuctionLauncherAtom } from '@/state/dtf/atoms'
import { AuctionRound } from '@reserve-protocol/dtf-rebalance-lib'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  activeAuctionAtom,
  rebalanceMetricsAtom,
  rebalanceTokenMapAtom,
} from '../atoms'
import useRebalanceParams from '../hooks/use-rebalance-params'
import CommunityLaunchAuctionsButton from './community-launch-auctions-button'
import LaunchAuctionsButton from './launch-auctions-button'
import RebalanceActionOverview from './rebalance-action-overview'

const ROUND_TITLE = {
  [AuctionRound.EJECT]: 'Remove Tokens',
  [AuctionRound.PROGRESS]: 'Progressing',
  [AuctionRound.FINAL]: 'Precision Rebalancing',
}

// const rebalanceDescriptionAtom = atom((get) => {
//   const metrics = get(rebalanceMetricsAtom)
//   const tokenMap = get(rebalanceTokenMapAtom)

//   if (!metrics || !Object.keys(tokenMap).length) return ''

//   const formatTokens = (tokens: string[]) => {
//     const symbols = tokens.map(
//       (token) => tokenMap[token.toLowerCase()]?.symbol || ''
//     )
//     if (symbols.length <= 3) return symbols.join(', ')
//     return `${symbols.slice(0, 3).join(', ')}, +${symbols.length - 3}`
//   }

//   return `Trade ${formatTokens(metrics.surplusTokens)} for ${formatTokens(metrics.deficitTokens)}`
// })

const RoundDescription = () => {
  // const description = useAtomValue(rebalanceDescriptionAtom)
  const metrics = useAtomValue(rebalanceMetricsAtom)
  const params = useRebalanceParams()
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)
  const description = useMemo(() => {
    const removal =
      metrics?.round === AuctionRound.EJECT &&
      !!params &&
      params?.rebalance.weights.find((w) => w.spot === 0n)

    if (!removal) return 'Buy/sell tokens to move closer to proposed weights.'

    const tokens: string[] = []

    for (const [token, weight] of Object.entries(params.initialWeights)) {
      if (weight.spot === 0n) {
        tokens.push(tokenMap[token.toLowerCase()]?.symbol || '')
      }
    }

    const formattedTokens =
      tokens.length > 1
        ? `${tokens.slice(0, -1).join(', ')} and ${tokens[tokens.length - 1]}`
        : tokens[0]

    return `Remove ${formattedTokens} from the basket`
  }, [params, metrics, tokenMap])

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl text-primary font-semibold">
        {ROUND_TITLE[metrics?.round ?? 0]}
      </h1>
      <p className="text-legend">{description}</p>
    </div>
  )
}

const RebalanceAction = () => {
  const activeAuction = useAtomValue(activeAuctionAtom)
  const isAuctionLauncher = useAtomValue(isAuctionLauncherAtom)

  // Don't show the action component if there's an active auction
  if (activeAuction) {
    return null
  }

  return (
    <div className="bg-background rounded-3xl">
      <RoundDescription />
      <RebalanceActionOverview />
      {isAuctionLauncher ? (
        <LaunchAuctionsButton />
      ) : (
        <CommunityLaunchAuctionsButton />
      )}
    </div>
  )
}

export default RebalanceAction
