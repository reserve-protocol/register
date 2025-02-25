import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { chainIdAtom } from 'state/atoms'
import { wagmiConfig } from 'state/chain'
import { useBlockNumber } from 'wagmi'
import { getBlock } from 'wagmi/actions'

function useBlockTimestamp(blockNumber?: number) {
  const chainId = useAtomValue(chainIdAtom)
  const [timestamp, setTimestamp] = useState<number | undefined>(undefined)
  const { data: currentBlockNumber } = useBlockNumber()

  const getBlockTimestampOrUndefined = async (_blockNumber: bigint) => {
    try {
      const block = await getBlock(wagmiConfig, {
        blockNumber: _blockNumber,
        chainId,
      })
      return Number(block.timestamp)
    } catch {
      return undefined
    }
  }

  const getAverageBlockTime = async (blocksToConsider = 100n) => {
    try {
      const latestBlock = await getBlock(wagmiConfig, {
        blockTag: 'latest',
        chainId,
      })
      const pastBlock = await getBlock(wagmiConfig, {
        blockNumber: latestBlock.number - blocksToConsider,
        chainId,
      })
      const timeDifference = latestBlock.timestamp - pastBlock.timestamp
      return timeDifference / blocksToConsider
    } catch {
      return undefined
    }
  }

  const estimateFutureBlockTimestamp = async (_blockNumber: bigint) => {
    const blockTime = await getAverageBlockTime()
    if (!blockTime || !currentBlockNumber) return
    const blockDifference = _blockNumber - currentBlockNumber
    const estimatedTime =
      Math.floor(Date.now() / 1000) +
      Number(blockDifference) * Number(blockTime)
    return estimatedTime
  }

  useEffect(() => {
    if (!blockNumber || !currentBlockNumber) {
      setTimestamp(undefined)
      return
    }

    if (blockNumber <= currentBlockNumber) {
      getBlockTimestampOrUndefined(BigInt(blockNumber)).then(setTimestamp)
    } else {
      estimateFutureBlockTimestamp(BigInt(blockNumber)).then(setTimestamp)
    }
  }, [blockNumber, currentBlockNumber])

  return timestamp
}

export default useBlockTimestamp
