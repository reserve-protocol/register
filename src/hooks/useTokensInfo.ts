import { Token } from '@/types'
import { useMemo } from 'react'
import { Address } from 'viem'
import { erc20Abi } from 'viem'
import { useReadContracts } from 'wagmi'

const useTokensInfo = (addresses: string[]) => {
  return useReadContracts({
    contracts: addresses.flatMap((address) => [
      {
        address: address as Address,
        abi: erc20Abi,
        functionName: 'name',
      },
      {
        address: address as Address,
        abi: erc20Abi,
        functionName: 'symbol',
      },
      {
        address: address as Address,
        abi: erc20Abi,
        functionName: 'decimals',
      },
    ]),
    allowFailure: false,
    query: {
      enabled: addresses.length > 0,
      select: (data) => {
        let index = 0
        return addresses.reduce(
          (acc, address) => {
            acc[address.toLowerCase()] = {
              address: address as Address,
              name: data[index] as string,
              symbol: data[index + 1] as string,
              decimals: data[index + 2] as number,
            }
            index += 3
            return acc
          },
          {} as Record<string, Token>
        )
      },
    },
  })
}

export default useTokensInfo
