import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'
import { BigNumber } from 'ethers'
import { ERC20Interface } from 'abis'
import { useGenericCalls } from './useCall'
import useBlockNumber from './useBlockNumber'

/**
 * Returns a boolean if the given tokens has a certain amount of allowance to spend
 *
 * @param tokens
 * @param spender
 * @param amount
 * @returns
 */
const useTokensHasAllowance = (
  tokens: [string, BigNumber][],
  spender: string
): boolean => {
  const { account } = useWeb3React()
  const blockNumber = useBlockNumber()

  const calls = useMemo(
    () =>
      tokens.map(([address]) => ({
        abi: ERC20Interface,
        address,
        method: 'allowance',
        args: [account, spender],
      })),
    [tokens.toString(), account, blockNumber]
  )

  const allowances = <any[]>useGenericCalls(calls) ?? []

  return (
    !!allowances.length &&
    allowances.every((value, index) => value?.[0]?.gte(tokens[index][1]))
  )
}

export default useTokensHasAllowance
