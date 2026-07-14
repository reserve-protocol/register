import { isAuctionLauncherAtom, isHybridDTFAtom } from '@/state/dtf/atoms'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import { AuctionRound, WeightRange } from '@reserve-protocol/dtf-rebalance-lib'
import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'
import {
  activeAuctionAtom,
  rebalanceMetricsAtom,
  rebalanceTokenMapAtom,
  areWeightsSavedAtom,
  rebalanceAuctionsAtom,
  showManageWeightsViewAtom,
} from '../atoms'
import useRebalanceParams from '../hooks/use-rebalance-params'
import CommunityLaunchAuctionsButton from './community-launch-auctions-button'
import LaunchAuctionsButton from './launch-auctions-button'
import RebalanceActionOverview from './rebalance-action-overview'
import { Button } from '@/components/ui/button'
import { PencilRuler } from 'lucide-react'
import { getRebalanceWeights } from '../utils/transforms'

const ROUND_TITLE: Record<number, MessageDescriptor> = {
  [AuctionRound.EJECT]: msg`Remove Tokens`,
  [AuctionRound.PROGRESS]: msg`Progressing`,
  [AuctionRound.FINAL]: msg`Precision Rebalancing`,
}

const RoundDescription = () => {
  const { t } = useLingui()
  const metrics = useAtomValue(rebalanceMetricsAtom)
  const params = useRebalanceParams()
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)

  const description = useMemo(() => {
    const defaultDescription = t`Buy/sell tokens to move closer to proposed weights.`
    if (!params) return defaultDescription

    // Get weights using version-aware helper
    const rebalanceWeights = getRebalanceWeights(
      params.rebalance,
      params.folioVersion
    )

    const removal =
      metrics?.round === AuctionRound.EJECT &&
      rebalanceWeights.find((w: WeightRange) => w.spot === 0n)

    if (!removal) return defaultDescription

    const tokens: string[] = []

    for (const [token, weight] of Object.entries(params.initialWeights)) {
      if (weight.spot === 0n) {
        tokens.push(tokenMap[token.toLowerCase()]?.symbol || '')
      }
    }

    const formattedTokens =
      tokens.length > 1
        ? t`${tokens.slice(0, -1).join(', ')} and ${tokens[tokens.length - 1]}`
        : tokens[0]

    return t`Remove ${formattedTokens} from the basket`
  }, [params, metrics, tokenMap, t])

  return (
    <div className="p-4 md:p-6">
      <h1
        data-testid="auctions-round"
        data-round={String(metrics?.round ?? '')}
        className="text-2xl text-primary font-semibold"
      >
        {t(ROUND_TITLE[metrics?.round ?? 0])}
      </h1>
      <p className="text-legend">{description}</p>
    </div>
  )
}

const ManageWeights = () => {
  const setShowManageWeights = useSetAtom(showManageWeightsViewAtom)

  return (
    <div className="bg-background rounded-3xl">
      <div className="p-4 md:p-6">
        <div className="rounded-full border w-8 h-8 border-primary text-primary flex items-center justify-center">
          <PencilRuler className="w-4 h-4" />
        </div>
        <h1 className="text-xl text-primary mt-3">
          <Trans>Specify Exact Basket Weights</Trans>
        </h1>
        <p className="text-legend">
          <Trans>
            Set exact basket weights before launching the rebalance auctions
          </Trans>
        </p>
      </div>
      <div className="p-2 pt-0 ">
        <Button
          variant="outline-primary"
          className="w-full rounded-xl text-base py-6"
          onClick={() => setShowManageWeights(true)}
        >
          <Trans>Manage Weights</Trans>
        </Button>
      </div>
    </div>
  )
}

const RebalanceAction = () => {
  const activeAuction = useAtomValue(activeAuctionAtom)
  const isAuctionLauncher = useAtomValue(isAuctionLauncherAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)
  const areWeightsSaved = useAtomValue(areWeightsSavedAtom)
  const auctions = useAtomValue(rebalanceAuctionsAtom)

  const canManageWeights =
    isAuctionLauncher &&
    isHybridDTF &&
    auctions.length === 0 &&
    !areWeightsSaved

  // Don't show the action component if there's an active auction
  if (activeAuction) {
    return null
  }

  if (canManageWeights) {
    return <ManageWeights />
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
