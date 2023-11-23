import DutchTradeAbi from 'abis/DutchTrade'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { blockAtom, chainIdAtom } from 'state/atoms'
import { Address, formatEther } from 'viem'
import { useContractRead } from 'wagmi'

const useAuctionPrices = (
  contractAddress: Address
): [number, bigint, number] => {
  const currentBlock = useAtomValue(blockAtom)
  const [fee, setFee] = useState([0, 0n, 0] as [number, bigint, number])
  const chainId = useAtomValue(chainIdAtom)

  const { data: priceResult } = useContractRead({
    abi: DutchTradeAbi,
    address: contractAddress,
    functionName: 'bidAmount',
    args: [BigInt(currentBlock ?? 0)],
    enabled: !!currentBlock,
    chainId,
  })
  const { data: nextPriceResult } = useContractRead({
    abi: DutchTradeAbi,
    address: contractAddress,
    functionName: 'bidAmount',
    args: [BigInt((currentBlock ?? 0) + 1)],
    enabled: !!currentBlock,
    chainId,
  })

  useEffect(() => {
    if (priceResult && nextPriceResult) {
      setFee([
        Number(formatEther(priceResult)),
        priceResult,
        Number(formatEther(nextPriceResult)),
      ])
    }
  }, [priceResult, nextPriceResult])

  return fee
}

export default useAuctionPrices
