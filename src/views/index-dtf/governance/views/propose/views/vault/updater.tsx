import { atom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  addedRewardTokensAtom,
  isProposalConfirmedAtom,
  removedRewardTokensAtom,
} from './atoms'

const resetAtom = atom(null, (get, set) => {
  set(removedRewardTokensAtom, [])
  set(addedRewardTokensAtom, {})
  set(isProposalConfirmedAtom, false)
})

const Updater = () => {
  const reset = useSetAtom(resetAtom)

  useEffect(() => {
    return () => {
      reset()
    }
  }, [])

  return null
}

export default Updater
