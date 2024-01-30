import RToken from "abis/RToken"
import { ListedToken } from "hooks/useTokenList"
import { useMemo } from "react"
import { getAddress } from "viem"
import { useContractReads } from "wagmi"

const usePriceETH = ({
  id,
  chain,
  price,
  supply,
  targetUnits
}: Partial<Pick<ListedToken,  "id" | "chain" | "price" | "supply" | 'targetUnits'>>) => {
  const { data } = useContractReads({
    contracts: [
      ...(targetUnits === 'ETH' && id && chain
        ? [
            {
              address: getAddress(id),
              abi: RToken,
              functionName: 'basketsNeeded',
              chainId: chain
            },
            {
              address: getAddress(id),
              abi: RToken,
              functionName: 'totalSupply',
              chainId: chain
            },
          ]
        : []),
    ],
    allowFailure: false,
  })

  const priceETHTerms = useMemo(() => {
    const basketsNeeded = (data as bigint[])?.[0]
    const totalSupply = (data as bigint[])?.[1]

    if (!basketsNeeded || !totalSupply) return undefined

    return Number((basketsNeeded * 1000n) / totalSupply) / 1000
  }, [data])

  const supplyETHTerms = useMemo(() => {
    if (!priceETHTerms || !supply || !price) return undefined
    return (supply / price) * priceETHTerms
  }, [priceETHTerms, supply])

  return { priceETHTerms, supplyETHTerms }
}

export default usePriceETH
