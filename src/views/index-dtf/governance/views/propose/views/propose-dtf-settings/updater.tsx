import dtfIndexAbiV2 from '@/abis/dtf-index-abi-v2'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useReadContract } from 'wagmi'
import {
  dustTokenBalancesAtom,
  isProposalConfirmedAtom,
  proposalDescriptionAtom,
  removedBasketTokensAtom,
} from './atoms'

const resetAtom = atom(null, (get, set) => {
  set(removedBasketTokensAtom, [])
  set(isProposalConfirmedAtom, false)
  set(proposalDescriptionAtom, undefined)
})

const DustTokenBalancesUpdater = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const setTokenBalances = useSetAtom(dustTokenBalancesAtom)

  const { data: balances } = useReadContract({
    address: indexDTF?.id,
    abi: dtfIndexAbiV2,
    functionName: 'totalAssets',
    chainId,
    args: [],
    query: {
      select: (data) => {
        const [tokens, balances] = data

        return tokens.reduce(
          (acc, token, index) => {
            acc[token.toLowerCase()] = balances[index]
            return acc
          },
          {} as Record<string, bigint>
        )
      },
    },
  })

  useEffect(() => {
    if (balances) {
      setTokenBalances(balances)
    }
  }, [balances])

  return null
}

const Updater = () => {
  const reset = useSetAtom(resetAtom)

  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  return (
    <>
      <DustTokenBalancesUpdater />
    </>
  )
}

export default Updater
