import RToken from 'abis/RToken'
import { ListedToken } from 'hooks/useTokenList'
import { useMemo } from 'react'
import { formatEther, getAddress } from 'viem'
import { useReadContracts } from 'wagmi'

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
  const { data } = useReadContracts({
    contracts:
      targetUnits === 'ETH' && id && chain && (!basketsNeeded || !supply)
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
        : [],
    allowFailure: false,
  })

  return useMemo(() => {
    const [basketsRaw, supplyRaw] = data ?? []
    const basketNeededValue =
      basketsRaw !== undefined ? Number(formatEther(basketsRaw)) : basketsNeeded
    const totalSupplyValue =
      supplyRaw !== undefined ? Number(formatEther(supplyRaw)) : supply

    let priceETHTerms: number | undefined = undefined
    let supplyETHTerms: number | undefined = undefined

    if (basketNeededValue && totalSupplyValue && supply && price) {
      priceETHTerms =
        Math.trunc((basketNeededValue / totalSupplyValue) * 10000) / 10000
      supplyETHTerms = (supply / price) * priceETHTerms
    }

    return { priceETHTerms, supplyETHTerms }
  }, [data, basketsNeeded, supply, price])
}

export default usePriceETH
