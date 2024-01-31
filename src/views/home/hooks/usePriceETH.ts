import RToken from 'abis/RToken'
import { ListedToken } from 'hooks/useTokenList'
import { useMemo } from 'react'
import { formatEther, getAddress } from 'viem'
import { useContractReads } from 'wagmi'

const usePriceETH = ({
  id,
  chain,
  price,
  supply,
  targetUnits,
  basketsNeeded,
}: Partial<
  Pick<ListedToken, 'id' | 'chain' | 'price' | 'supply' | 'targetUnits'> & {
    basketsNeeded: number
  }
>) => {
  const { data } = useContractReads({
    contracts: [
      ...(targetUnits === 'ETH' && id && chain && (!basketsNeeded || !supply)
        ? [
            {
              address: getAddress(id),
              abi: RToken,
              functionName: 'basketsNeeded',
              chainId: chain,
            },
            {
              address: getAddress(id),
              abi: RToken,
              functionName: 'totalSupply',
              chainId: chain,
            },
          ]
        : []),
    ],
    allowFailure: false,
  })

  const basketNeededValue = useMemo(() => {
    const value = (data as bigint[])?.[0]
    return value ? Number(formatEther(value)) : basketsNeeded
  }, [data, basketsNeeded])

  const totalSupplyValue = useMemo(() => {
    const value = (data as bigint[])?.[1]
    return value ? Number(formatEther(value)) : supply
  }, [data, supply])

  const priceETHTerms = useMemo(() => {
    if (!basketNeededValue || !totalSupplyValue || targetUnits !== 'ETH') return undefined
    return Math.trunc(basketNeededValue / totalSupplyValue * 10000) / 10000
  }, [basketNeededValue, totalSupplyValue])

  const supplyETHTerms = useMemo(() => {
    if (!priceETHTerms || !supply || !price) return undefined
    return (supply / price) * priceETHTerms
  }, [priceETHTerms, supply, price])

  return { priceETHTerms, supplyETHTerms }
}

export default usePriceETH
