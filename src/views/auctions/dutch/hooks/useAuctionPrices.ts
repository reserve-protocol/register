import BlockDutchTrade from 'abis/BlockDutchTrade'
import DutchTradeAbi from 'abis/DutchTrade'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import {
  blockAtom,
  blockTimestampAtom,
  chainIdAtom,
  isModuleLegacyAtom,
} from 'state/atoms'
import { blockDuration } from 'utils/constants'
import { Address, formatUnits } from 'viem'
import { useContractRead } from 'wagmi'

const useAuctionPrices = (
  contractAddress: Address,
  decimals: number
): [number, bigint, number] => {
  const currentBlock = useAtomValue(blockAtom)
  const currentTimestamp = useAtomValue(blockTimestampAtom)
  const [fee, setFee] = useState([0, 0n, 0] as [number, bigint, number])
  const chainId = useAtomValue(chainIdAtom)
  // block based auctions
  const { trading: isLegacy } = useAtomValue(isModuleLegacyAtom)

  const call = useMemo(
    () => ({
      abi: (isLegacy ? BlockDutchTrade : DutchTradeAbi) as any,
      address: contractAddress,
      functionName: 'bidAmount',
      args: [isLegacy ? BigInt(currentBlock ?? 0) : BigInt(currentTimestamp)],
      enabled: !!currentBlock,
      chainId,
    }),
    [currentBlock, currentTimestamp, contractAddress, chainId]
  )

  const { data: priceResult } = <{ data: bigint | undefined }>(
    useContractRead(call)
  )
  const { data: nextPriceResult } = <{ data: bigint | undefined }>(
    useContractRead({
      ...call,
      args: [
        isLegacy
          ? call.args[0] + 1n
          : call.args[0] + BigInt(blockDuration[chainId] ?? 1),
      ],
    })
  )

  useEffect(() => {
    if (priceResult && nextPriceResult) {
      setFee([
        Number(formatUnits(priceResult, decimals)),
        priceResult,
        Number(formatUnits(nextPriceResult, decimals)),
      ])
    }
  }, [priceResult, nextPriceResult])

  return fee
}

export default useAuctionPrices
