import { atom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  isProposalConfirmedAtom,
  proposalDescriptionAtom,
  removedBasketTokensAtom,
} from './atoms'

const resetAtom = atom(null, (get, set) => {
  set(removedBasketTokensAtom, [])
  set(isProposalConfirmedAtom, false)
  set(proposalDescriptionAtom, undefined)
})

const Updater = () => {
  const reset = useSetAtom(resetAtom)

  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  return null
}

export default Updater
