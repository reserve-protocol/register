import LegacyUpdater from './legacy/updater'
import { useSetAtom } from 'jotai'
import { rebalancesAtom } from './atoms'
import {
  useIndexDtfIdentity,
  useIndexDtfRebalances,
} from '@reserve-protocol/react-sdk'
import { useEffect } from 'react'
import { toRebalance } from './utils/sdk-mappers'
import type { IndexDtfRebalance } from '@reserve-protocol/react-sdk'

// Module-level so React Query memoizes the selection; an inline select returns
// a fresh array every render and the atom-sync effect below would loop.
const selectRebalances = (rebalances: readonly IndexDtfRebalance[]) =>
  rebalances.map(toRebalance)

const useRebalances = () => {
  const identity = useIndexDtfIdentity()

  return useIndexDtfRebalances(identity.address ? identity : undefined, {
    select: selectRebalances,
  })
}

const RebalancesUpdater = () => {
  const setRebalances = useSetAtom(rebalancesAtom)
  const { data } = useRebalances()

  useEffect(() => {
    if (data) setRebalances(data)
  }, [data, setRebalances])

  useEffect(() => {
    return () => {
      setRebalances(undefined)
    }
  }, [])

  return null
}

const Updater = () => (
  <>
    <RebalancesUpdater />
    <LegacyUpdater />
  </>
)

export default Updater
