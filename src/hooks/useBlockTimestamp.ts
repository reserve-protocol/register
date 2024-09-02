import { useState, useEffect } from 'react'
import { useBlockNumber } from 'wagmi'
import { usePublicClient } from 'wagmi'

function useBlockTimestamp(blockNumber?: number) {
  const [timestamp, setTimestamp] = useState<number | undefined>(undefined)
  const client = usePublicClient()
  const { data: currentBlockNumber } = useBlockNumber()

  const getBlockTimestampOrUndefined = async (_blockNumber: bigint) => {
    try {
      const block = await client.getBlock({ blockNumber: _blockNumber })
      return Number(block.timestamp)
    } catch {
      return undefined
    }
  }

  const getAverageBlockTime = async (blocksToConsider = 100n) => {
    try {
      const latestBlock = await client.getBlock({
        blockTag: 'latest',
      })
      const pastBlock = await client.getBlock({
        blockNumber: latestBlock.number - blocksToConsider,
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
