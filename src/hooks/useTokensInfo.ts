import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import { ChainId } from '@/utils/chains'
import { Filter } from 'bad-words'
import { useAtomValue } from 'jotai'
import { Address, erc20Abi_bytes32, Hex, trim, hexToString } from 'viem'
import { erc20Abi } from 'viem'
import { useReadContracts } from 'wagmi'

const ERC20_BYTES32_MAP: Record<number, string[]> = {
  [ChainId.Mainnet]: ['0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'],
}

const useTokensInfo = (addresses: string[]) => {
  const chainId = useAtomValue(chainIdAtom)

  return useReadContracts({
    contracts: addresses.flatMap((address) => {
      const useBytes32 =
        ERC20_BYTES32_MAP[chainId]?.includes(address.toLowerCase()) ?? false
      return [
        {
          address: address as Address,
          abi: useBytes32 ? erc20Abi_bytes32 : erc20Abi,
          functionName: 'name',
          chainId,
        },
        {
          address: address as Address,
          abi: useBytes32 ? erc20Abi_bytes32 : erc20Abi,
          functionName: 'symbol',
          chainId,
        },
        {
          address: address as Address,
          abi: erc20Abi,
          functionName: 'decimals',
          chainId,
        },
      ]
    }),
    allowFailure: false,
    query: {
      enabled: addresses.length > 0,
      select: (data) => {
        let index = 0
        return addresses.reduce(
          (acc, address) => {
            const useBytes32 =
              ERC20_BYTES32_MAP[chainId]?.includes(address.toLowerCase()) ??
              false

            const rawName = data[index]
            const rawSymbol = data[index + 1]
            const decimals = data[index + 2] as number

            const filter = new Filter()
            filter.removeWords('god')

            const name = filter.clean(
              useBytes32
                ? hexToString(trim(rawName as Hex, { dir: 'right' }))
                : (rawName as string)
            )
            const symbol = useBytes32
              ? hexToString(trim(rawSymbol as Hex, { dir: 'right' }))
              : (rawSymbol as string)

            const token: Token = {
              address: address.toLowerCase() as Address,
              name,
              symbol,
              decimals,
            }

            acc[address.toLowerCase()] = token
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
