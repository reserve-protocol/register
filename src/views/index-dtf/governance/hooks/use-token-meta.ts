import useTokenList from '@/hooks/use-token-list'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { erc20Abi, type Address } from 'viem'
import { useReadContracts } from 'wagmi'

const toKey = (address: string) => address.toLowerCase()

export type TokenMeta = Pick<Token, 'symbol' | 'name' | 'logoURI'>

// Names come from the zapper token list and the basket; anything else is read on-chain.
const useTokenMeta = (addresses: string[]) => {
  const chainId = useAtomValue(chainIdAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const { data: tokenList } = useTokenList(chainId)

  const known = useMemo(() => {
    const map = new Map<string, TokenMeta>()
    for (const token of [...(tokenList ?? []), ...(basket ?? [])]) {
      map.set(toKey(token.address), token)
    }
    return map
  }, [tokenList, basket])

  const unknown = addresses.filter((address) => !known.has(toKey(address)))
  const { data: reads } = useReadContracts({
    contracts: unknown.flatMap((address) => [
      { address: address as Address, abi: erc20Abi, functionName: 'symbol', chainId },
      { address: address as Address, abi: erc20Abi, functionName: 'name', chainId },
    ]),
    query: { enabled: unknown.length > 0 },
  })

  return (address: string): TokenMeta | undefined => {
    const meta = known.get(toKey(address))
    if (meta) return meta
    const index = unknown.findIndex((item) => toKey(item) === toKey(address))
    const symbol = reads?.[index * 2]
    const name = reads?.[index * 2 + 1]
    if (symbol?.status !== 'success') return undefined
    return {
      symbol: symbol.result as string,
      name: name?.status === 'success' ? (name.result as string) : '',
    }
  }
}

export default useTokenMeta
