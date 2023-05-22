import { useWeb3React } from '@web3-react/core'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import {
  blockAtom,
  blockTimestampAtom,
  chainIdAtom,
  providerAtom,
} from './../state/atoms'
import useDebounce from './useDebounce'
import useIsWindowVisible from './useIsWindowVisible'

function useBlock() {
  const { chainId, provider } = useWeb3React()
  const windowVisible = useIsWindowVisible()
  const [state, setState] = useState<{ chainId?: number; block?: number }>({
    chainId,
  })

  const onBlock = useCallback(
    (block: number) => {
      setState((prevState) => {
        if (prevState.chainId === chainId) {
          if (typeof prevState.block !== 'number') return { chainId, block }
          return { chainId, block: Math.max(block, prevState.block) }
        }
        return prevState
      })
    },
    [chainId]
  )

  useEffect(() => {
    if (provider && chainId && windowVisible) {
      setState((prevState) =>
        prevState.chainId === chainId ? prevState : { chainId }
      )

      provider
        .getBlockNumber()
        .then(onBlock)
        .catch((error) => {
          console.error(
            `Failed to get block number for chainId ${chainId}`,
            error
          )
        })

      provider.on('block', onBlock)
      return () => {
        provider.removeListener('block', onBlock)
      }
    }
    return undefined
  }, [provider, onBlock, windowVisible])

  const debouncedBlock = useDebounce(state.block, 100)
  return state.block ? debouncedBlock : undefined
}

// TODO: Move to state/web3
export function BlockUpdater() {
  const setBlock = useSetAtom(blockAtom)
  const setChain = useSetAtom(chainIdAtom)
  const setProvider = useSetAtom(providerAtom)
  const setBlockTimestamp = useSetAtom(blockTimestampAtom)
  const block = useBlock()
  const { provider, chainId } = useWeb3React()

  useEffect(() => {
    setProvider(provider)
  }, [provider])

  // On chain change, store new chain and reset block number
  useEffect(() => {
    setBlock(0)
    setChain(chainId)
  }, [chainId])

  useEffect(() => {
    setBlock(block)

    if (block && provider) {
      provider.getBlock(block).then((blockData) => {
        if (blockData?.timestamp) {
          setBlockTimestamp(blockData.timestamp)
        }
      })
    }
  }, [block, setBlock])
  return null
}

/** Requires that BlockUpdater be installed in the DOM tree. */
export default function useBlockNumber(): number | undefined {
  const { chainId } = useWeb3React()
  const block = useAtomValue(blockAtom)
  return chainId && block ? block : undefined
}

export function useFastForwardBlockNumber(): (block: number) => void {
  return useSetAtom(blockAtom)
}
