import { Address } from 'viem'
import { useChainlinkPrices } from './useChainlinkPrices'

export const useChainlinkPrice = (chainId: number, tokenAddress?: Address) => {
  const result = useChainlinkPrices(
    chainId,
    tokenAddress ? [tokenAddress] : undefined
  )
  return result?.[0]
}
