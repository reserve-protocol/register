import { indexDTFAtom } from '@/state/dtf/atoms'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  isProposalConfirmedAtom,
  newRewardTokenAtom,
  proposedRewardTokensAtom,
} from './atoms'

const resetAtom = atom(null, (get, set) => {
  set(proposedRewardTokensAtom, undefined)
  set(newRewardTokenAtom, [])
  set(isProposalConfirmedAtom, false)
})

const Updater = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const reset = useSetAtom(resetAtom)
  const [rewardTokens, setProposedRewardTokens] = useAtom(
    proposedRewardTokensAtom
  )

  useEffect(() => {
    if (indexDTF && !rewardTokens) {
      setProposedRewardTokens(indexDTF.stToken?.rewardTokens || [])
    }
  }, [indexDTF])

  useEffect(() => {
    return () => {
      reset()
    }
  }, [])

  return null
}

export default Updater
