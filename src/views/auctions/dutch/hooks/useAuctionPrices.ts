import DutchTradeAbi from 'abis/DutchTrade'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { blockAtom } from 'state/atoms'
import { Address, formatEther } from 'viem'
import { useContractRead } from 'wagmi'

const useAuctionPrices = (contractAddress: Address): [number, number] => {
  const currentBlock = useAtomValue(blockAtom)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [nextPrice, setNextPrice] = useState(0)

  const { data: priceResult } = useContractRead({
    abi: DutchTradeAbi,
    address: contractAddress,
    functionName: 'bidAmount',
    args: [BigInt(currentBlock ?? 0)],
    enabled: !!currentBlock,
  })
  const { data: nextPriceResult } = useContractRead({
    abi: DutchTradeAbi,
    address: contractAddress,
    functionName: 'bidAmount',
    args: [BigInt((currentBlock ?? 0) + 1)],
    enabled: !!currentBlock,
  })

  useEffect(() => {
    if (priceResult) {
      setCurrentPrice(Number(formatEther(priceResult)))
    }
  }, [priceResult])

  useEffect(() => {
    if (nextPriceResult) {
      setNextPrice(Number(formatEther(nextPriceResult)))
    }
  }, [nextPriceResult])

  return [currentPrice, nextPrice]
}

export default useAuctionPrices
