import { StringMap } from 'types'
import { useMemo } from 'react'
import { ERC20Interface } from 'abis'
import { useContractCalls } from './useCall'
import useBlockNumber from './useBlockNumber'
import { formatUnits } from '@ethersproject/units'

/**
 * Returns a hash of balances for the given tokens
 *
 * @param tokens
 * @returns
 */
const useTokensBalance = (
  tokens: [string, number][],
  account: string
): StringMap => {
  const calls = useMemo(
    () =>
      tokens.map(([address]) => ({
        abi: ERC20Interface,
        address,
        method: 'balanceOf',
        args: [account],
      })),
    [tokens.toString(), account]
  )

  const balances = <any[]>useContractCalls(calls) ?? []

  return balances.reduce((acc, current, index) => {
    const [address, decimals] = tokens[index]
    if (current?.value) {
      acc[address] = parseFloat(formatUnits(current.value[0], decimals))
    } else {
      acc[address] = 0
    }

    return acc
  }, <StringMap>{})
}

export default useTokensBalance
