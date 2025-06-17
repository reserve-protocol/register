import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import {
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

const RebalanceMetricsUpdater = () => {
  const [metrics, setRebalanceMetrics] = useAtom(rebalanceMetricsAtom)
  const setRebalancePercent = useSetAtom(rebalancePercentAtom)
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
          prices,
          isTrackingDTF,
        } = params

        const [, rebalanceMetrics] = getRebalanceOpenAuction(
          currentRebalance.rebalance.tokens,
          rebalance,
          supply,
          currentFolio,
          initialFolio,
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
    if (rebalanceParams && currentRebalance) {
      updateMetrics(
        rebalanceParams,
        currentRebalance,
        metrics?.relativeProgression &&
          rebalancePercent > metrics.relativeProgression
          ? rebalancePercent
          : 0.95
      )
    }
  }, [rebalanceParams, currentRebalance, rebalancePercent, updateMetrics])

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
      setRebalancePercent(0)
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
    </>
  )
}

export default Updater
