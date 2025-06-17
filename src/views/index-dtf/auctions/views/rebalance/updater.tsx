import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { currentProposalIdAtom, currentRebalanceAtom } from '../../atoms'
import {
  rebalanceAuctionsAtom,
  rebalanceMetricsAtom,
  rebalancePercentAtom,
} from './atoms'
import useRebalanceAuctions from './hooks/use-rebalance-auctions'
import useRebalanceParams from './hooks/use-rebalance-params'
import getRebalanceOpenAuction from './utils/get-rebalance-open-auction'
import { useParams } from 'react-router-dom'

const RebalanceMetricsUpdater = () => {
  const setRebalanceMetrics = useSetAtom(rebalanceMetricsAtom)
  const setRebalancePercent = useSetAtom(rebalancePercentAtom)
  const rebalanceParams = useRebalanceParams()
  const currentRebalance = useAtomValue(currentRebalanceAtom)

  useEffect(() => {
    if (rebalanceParams && currentRebalance) {
      try {
        const {
          supply,
          rebalance,
          currentFolio,
          initialFolio,
          prices,
          isTrackingDTF,
        } = rebalanceParams

        const [, rebalanceMetrics] = getRebalanceOpenAuction(
          currentRebalance.rebalance.tokens,
          rebalance,
          supply,
          currentFolio,
          initialFolio,
          prices,
          isTrackingDTF
        )

        setRebalanceMetrics({
          ...rebalanceMetrics,
          absoluteProgression: rebalanceMetrics.absoluteProgression * 100,
          relativeProgression: rebalanceMetrics.relativeProgression * 100,
          initialProgression: rebalanceMetrics.initialProgression * 100,
        })
        setRebalancePercent(rebalanceMetrics.absoluteProgression * 100)
      } catch (e) {
        console.error('Error getting rebalance metrics', e)
      }
    }
  }, [rebalanceParams, currentRebalance])

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
