import { BigNumber } from '@ethersproject/bignumber'
import { ERC20Interface } from 'abis'
import { useMemo } from 'react'
import { StringMap } from 'types'
import useBlockNumber from './useBlockNumber'
import { useContractCalls } from './useCall'

// TODO: Edge case if RSR is used as part of the basket?
// TODO: Maybe to be extra secure the hash key could be the two addresses token+spender
/**
 * Returns a hash of allowances for the given tokens
 *
 * @param tokens
 * @returns
 */
const useTokensAllowance = (
  tokens: [string, string][],
  account: string
): { [x: string]: BigNumber } => {
  const blockNumber = useBlockNumber()

  const calls = useMemo(
    () =>
      tokens.map(([address, spender]) => ({
        abi: ERC20Interface,
        address,
        method: 'allowance',
        args: [account, spender],
      })),
    [tokens.toString(), account, blockNumber]
  )

  const allowances = <any[]>useContractCalls(calls) ?? []

  return allowances.reduce((acc, current, index) => {
    const [address] = tokens[index]
    if (current?.value) {
      acc[address] = current.value[0]
    } else {
      acc[address] = 0
    }

    return acc
  }, <StringMap>{})
}

export default useTokensAllowance
