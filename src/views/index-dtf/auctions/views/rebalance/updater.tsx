import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import {
  apiRebalanceMetricsAtom,
  currentProposalIdAtom,
  currentRebalanceAtom,
  RebalanceByProposal,
} from '../../atoms'
import {
  rebalanceAuctionsAtom,
  rebalanceMetricsAtom,
  rebalancePercentAtom,
} from './atoms'
import useRebalanceAuctions from './hooks/use-rebalance-auctions'
import useRebalanceParams, {
  RebalanceParams,
} from './hooks/use-rebalance-params'
import getRebalanceOpenAuction from './utils/get-rebalance-open-auction'
import { useParams } from 'react-router-dom'
import { useRebalanceMetrics } from '../rebalance-list/hooks/use-rebalance-metrics'

const RebalanceMetricsUpdater = () => {
  const setRebalanceMetrics = useSetAtom(rebalanceMetricsAtom)
  const rebalancePercent = useAtomValue(rebalancePercentAtom)
  const rebalanceParams = useRebalanceParams()
  const currentRebalance = useAtomValue(currentRebalanceAtom)

  const updateMetrics = useCallback(
    (
      params: RebalanceParams,
      currentRebalance: RebalanceByProposal,
      rebalancePercent: number
    ) => {
      try {
        const {
          supply,
          rebalance,
          currentFolio,
          initialFolio,
          initialPrices,
          initialWeights,
          prices,
          isTrackingDTF,
        } = params

        const [, rebalanceMetrics] = getRebalanceOpenAuction(
          currentRebalance.rebalance.tokens,
          rebalance,
          supply,
          currentFolio,
          initialFolio,
          initialPrices,
          initialWeights,
          prices,
          isTrackingDTF,
          rebalancePercent
        )

        setRebalanceMetrics({
          ...rebalanceMetrics,
          absoluteProgression: rebalanceMetrics.absoluteProgression * 100,
          relativeProgression: rebalanceMetrics.relativeProgression * 100,
          initialProgression: rebalanceMetrics.initialProgression * 100,
        })
      } catch (e) {
        console.error('Error getting rebalance metrics', e)
      }
    },
    [setRebalanceMetrics]
  )

  useEffect(() => {
    if (rebalanceParams && currentRebalance && rebalancePercent) {
      updateMetrics(rebalanceParams, currentRebalance, rebalancePercent)
    }
  }, [rebalanceParams, currentRebalance, updateMetrics, rebalancePercent])

  return null
}

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
  const setRebalanceAuctions = useSetAtom(rebalanceAuctionsAtom)
  const setRebalancePercent = useSetAtom(rebalancePercentAtom)
  const { proposalId } = useParams()
  const setCurrentProposalId = useSetAtom(currentProposalIdAtom)

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
      <ApiRebalanceMetricsUpdater />
    </>
  )
}

export default Updater
