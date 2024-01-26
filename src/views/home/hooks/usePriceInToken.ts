import RToken from "abis/RToken"
import { ListedToken } from "hooks/useTokenList"
import { useMemo } from "react"
import { getAddress } from "viem"
import { useContractReads } from "wagmi"

const usePriceInToken = (token: ListedToken) => {
  const { data } = useContractReads({
    contracts: [
      ...(token.targetUnits === 'ETH'
        ? [
            {
              address: getAddress(token.id),
              abi: RToken,
              functionName: 'basketsNeeded',
            },
            {
              address: getAddress(token.id),
              abi: RToken,
              functionName: 'totalSupply',
            },
          ]
        : []),
    ],
    allowFailure: false,
  })

  const priceInToken = useMemo(() => {
    const basketsNeeded = (data as bigint[])?.[0]
    const totalSupply = (data as bigint[])?.[1]

    if (!basketsNeeded || !totalSupply) return undefined

    return Number((basketsNeeded * 100n) / totalSupply) / 100
  }, [data])

  const supplyInToken = useMemo(() => {
    if (!priceInToken) return undefined
    return (token.supply / token.price) * priceInToken
  }, [priceInToken, token.supply])

  return { priceInToken, supplyInToken }
}

export default usePriceInToken
