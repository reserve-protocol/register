import ERC20 from 'abis/ERC20'
import { useMemo } from 'react'
import { StringMap } from 'types'
import { Address, useContractReads } from 'wagmi'

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
  const calls = useMemo(
    () =>
      tokens.map(([address, spender]) => ({
        abi: ERC20,
        address: address as Address,
        functionName: 'allowance',
        args: [account as Address, spender as Address],
      })),
    [tokens.toString(), account]
  )

  const { data } = useContractReads({ contracts: calls, watch: true })

  if (!data) {
    return {}
  }

  return data.reduce((acc, current, index) => {
    const [address] = tokens[index]
    if (current.result) {
      acc[address] = current.result
    } else {
      acc[address] = 0
    }

    return acc
  }, <StringMap>{})
}

export default useTokensAllowance
