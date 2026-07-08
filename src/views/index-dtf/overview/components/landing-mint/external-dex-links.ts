import { ChainId } from '@/utils/chains'
import type { Address } from 'viem'

export type DtfDexLink = {
  label: string
  url: string
}

const DTF_DEXES: Partial<
  Record<number, Partial<Record<Lowercase<Address>, DtfDexLink[]>>>
> = {
  [ChainId.BSC]: {
    '0xa0fe4e0aeca5479705ce996615b2eacb6b6a10fb': [
      {
        label: 'PancakeSwap',
        url: 'https://pancakeswap.finance/swap?outputCurrency=0xa0Fe4e0aEca5479705ce996615B2EACB6b6a10Fb',
      },
    ],
    '0xd7ce7a841310982acd976d1a6fe7bb6063c5689d': [
      {
        label: 'PancakeSwap',
        url: 'https://pancakeswap.finance/swap?outputCurrency=0xD7cE7a841310982AcD976D1a6fe7BB6063c5689D',
      },
    ],
    '0x75617e7653f86f074cc30b9fd4ebf52ba9b62247': [
      {
        label: 'PancakeSwap',
        url: 'https://pancakeswap.finance/swap?outputCurrency=0x75617e7653f86f074Cc30b9Fd4eBf52bA9b62247',
      },
    ],
    '0x290bcc0fd5096cc3261ae2021841c7bc67cb0f51': [
      {
        label: 'PancakeSwap',
        url: 'https://pancakeswap.finance/swap?outputCurrency=0x290bCc0Fd5096cC3261AE2021841c7BC67Cb0f51',
      },
    ],
    '0xf571fe3f0d74521bc7310b111faea931c748f27b': [
      {
        label: 'PancakeSwap',
        url: 'https://pancakeswap.finance/swap?outputCurrency=0xf571Fe3F0d74521Bc7310B111Faea931C748f27B',
      },
    ],
  },
}

export const getDtfDexLinks = (
  chainId: number | undefined,
  address: Address | undefined
) => {
  if (!chainId || !address) return []

  return DTF_DEXES[chainId]?.[address.toLowerCase() as Lowercase<Address>] ?? []
}
