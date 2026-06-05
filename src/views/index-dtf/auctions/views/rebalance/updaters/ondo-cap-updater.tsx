import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { rebalancePercentAtom, rebalancePercentTouchedAtom } from '../atoms'
import useOndoLimitStatus from '../hooks/use-ondo-limit-status'

// Defaults the rebalance percent to the Ondo single-trade soft cap until the
// user moves the slider. Always mounted (not just in dev), so non-dev launches
// also render at the limit. The cap is soft: once touched, the dev can move
// above it (the slider surfaces a warning).
const OndoCapUpdater = () => {
  const { maxSafePercent } = useOndoLimitStatus()
  const [rebalancePercent, setRebalancePercent] = useAtom(rebalancePercentAtom)
  const touched = useAtomValue(rebalancePercentTouchedAtom)

  useEffect(() => {
    if (!touched && rebalancePercent > maxSafePercent) {
      setRebalancePercent(maxSafePercent)
    }
  }, [touched, rebalancePercent, maxSafePercent, setRebalancePercent])

  return null
}

export default OndoCapUpdater
