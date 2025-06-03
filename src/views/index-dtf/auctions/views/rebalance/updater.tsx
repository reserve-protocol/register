import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { currentRebalanceAtom } from '../../atoms'
import { rebalanceAuctionsAtom, rebalanceMetricsAtom } from './atoms'
import useRebalanceAuctions from './hooks/use-rebalance-auctions'
import useRebalanceParams from './hooks/use-rebalance-params'
import getRebalanceOpenAuction from './utils/get-rebalance-open-auction'

const RebalanceMetricsUpdater = () => {
  const setRebalanceMetrics = useSetAtom(rebalanceMetricsAtom)
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

        setRebalanceMetrics(rebalanceMetrics)
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

  useEffect(() => {
    if (data) {
      setRebalanceAuctions(data)
    }
  }, [data, setRebalanceAuctions])

  return (
    <>
      <RebalanceMetricsUpdater />
    </>
  )
}

export default Updater
