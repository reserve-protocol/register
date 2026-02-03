import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  apiRebalanceMetricsAtom,
  currentProposalIdAtom,
  currentRebalanceAtom,
} from '../../atoms'
import { useRebalanceMetrics } from '../rebalance-list/hooks/use-rebalance-metrics'
import { rebalanceAuctionsAtom, rebalanceErrorAtom, rebalancePercentAtom } from './atoms'
import useRebalanceAuctions from './hooks/use-rebalance-auctions'
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

// Fetch current rebalance auctions!
const Updater = () => {
  const { data } = useRebalanceAuctions()
  const { proposalId } = useParams()
  const setRebalanceAuctions = useSetAtom(rebalanceAuctionsAtom)
  const setRebalancePercent = useSetAtom(rebalancePercentAtom)
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
      <RebalanceMetricsUpdater />
      <RebalanceHistoricalWeightsUpdater />
      <ApiRebalanceMetricsUpdater />
    </>
  )
}

export default Updater
