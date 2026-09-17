import { folioVersionAtom } from '@/state/dtf/atoms'
import {
  useIndexDtfIdentity,
  useIndexDtfLatestAuction,
} from '@reserve-protocol/react-sdk'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  apiRebalanceMetricsAtom,
  currentProposalIdAtom,
  currentRebalanceAtom,
} from '../../atoms'
import { useRebalanceMetrics } from '../rebalance-list/hooks/use-rebalance-metrics'
import {
  latestAuctionAtom,
  rebalanceAuctionsAtom,
  rebalanceErrorAtom,
  rebalancePercentAtom,
  rebalancePercentTouchedAtom,
} from './atoms'
import { AUCTION_POLL_MS } from './hooks/use-rebalance-current-data'
import { isRebalanceOngoing } from './utils'
import useRebalanceAuctions from './hooks/use-rebalance-auctions'
import OndoCapUpdater from './updaters/ondo-cap-updater'
import RebalanceHistoricalWeightsUpdater from './updaters/rebalance-historical-weights'
import RebalanceMetricsUpdater from './updaters/rebalance-metrics-updater'

const ApiRebalanceMetricsUpdater = () => {
  const rebalance = useAtomValue(currentRebalanceAtom)
  const { metrics } = useRebalanceMetrics(rebalance?.proposal.id || '')
  const setApiRebalanceMetrics = useSetAtom(apiRebalanceMetricsAtom)

  useEffect(() => {
    if (metrics) {
      setApiRebalanceMetrics(metrics)
    }
  }, [metrics, setApiRebalanceMetrics])

  return null
}

const LatestAuctionUpdater = () => {
  const identity = useIndexDtfIdentity()
  const rebalance = useAtomValue(currentRebalanceAtom)
  const versionState = useAtomValue(folioVersionAtom)
  const setLatestAuction = useSetAtom(latestAuctionAtom)
  const major = versionState.status === 'ready' ? versionState.major : undefined
  const isSdkVersion = major === 5 || major === 6
  const availableUntil = rebalance?.rebalance.availableUntil

  const { data } = useIndexDtfLatestAuction(
    isSdkVersion && identity.address ? identity : undefined,
    {
      refetchInterval: () =>
        isRebalanceOngoing(availableUntil, Math.floor(Date.now() / 1000))
          ? AUCTION_POLL_MS
          : false,
    }
  )

  useEffect(() => {
    setLatestAuction(isSdkVersion ? data : undefined)
  }, [data, isSdkVersion, setLatestAuction])

  useEffect(() => () => setLatestAuction(undefined), [setLatestAuction])

  return null
}

// Fetch current rebalance auctions!
const Updater = () => {
  const { data } = useRebalanceAuctions()
  const { proposalId } = useParams()
  const setRebalanceAuctions = useSetAtom(rebalanceAuctionsAtom)
  const setRebalancePercent = useSetAtom(rebalancePercentAtom)
  const setRebalancePercentTouched = useSetAtom(rebalancePercentTouchedAtom)
  const setCurrentProposalId = useSetAtom(currentProposalIdAtom)
  const setRebalanceError = useSetAtom(rebalanceErrorAtom)

  useEffect(() => {
    if (data) {
      setRebalanceAuctions(data)
    }
  }, [data, setRebalanceAuctions])

  useEffect(() => {
    return () => {
      setRebalancePercent(100)
      setRebalancePercentTouched(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      setRebalanceError('')
    }
  }, [])

  useEffect(() => {
    if (proposalId) {
      setCurrentProposalId(proposalId)
    }

    return () => {
      setCurrentProposalId('')
    }
  }, [proposalId])

  return (
    <>
      <LatestAuctionUpdater />
      <RebalanceMetricsUpdater />
      <RebalanceHistoricalWeightsUpdater />
      <ApiRebalanceMetricsUpdater />
      <OndoCapUpdater />
    </>
  )
}

export default Updater
