import ERC20 from 'abis/ERC20'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom } from 'state/atoms'
import { StringMap } from 'types'
import { useWatchReadContracts } from './useWatchReadContract'
import { Address } from 'viem'

/**
 * Returns a hash of allowances for the given tokens
 *
 * @param tokens
 * @returns
 */
const useTokensAllowance = (
  tokens: [string, string][],
  account: string
): { [x: string]: bigint } => {
  // TODO: This maybe broken
  const chainId = useAtomValue(chainIdAtom)
  const calls = useMemo(
    () =>
      tokens.map(([address, spender]) => ({
        abi: ERC20,
        address: address as Address,
        functionName: 'allowance',
        args: [account as Address, spender as Address],
        chainId,
      })),
    [tokens.toString(), account, chainId]
  )

  const { data } = useWatchReadContracts({ contracts: calls })

  if (!data) {
    return {}
  }

  return data.reduce(
    (acc, current, index) => {
      const [address] = tokens[index]
      if (current.result) {
        acc[address] = current.result
      } else {
        acc[address] = 0
      }

      return acc
    },
    <StringMap>{}
  )
}

export default useTokensAllowance
