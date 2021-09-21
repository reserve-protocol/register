import { useMemo } from 'react'
import { useContractCalls, useEthers, ERC20Interface } from '@usedapp/core'
import { BigNumber, BigNumberish } from 'ethers'

/**
 * Returns a boolean if the given tokens has a certain amount of allowance to spend
 *
 * @param tokens
 * @param spender
 * @param amount
 * @returns
 */
const useTokensHasAllowance = (
  tokens: string[],
  spender: string,
  amount: BigNumberish
) => {
  const { account } = useEthers()

  const calls = useMemo(
    () =>
      tokens.map((address) => ({
        abi: ERC20Interface,
        address,
        method: 'allowance',
        args: [account, spender],
      })),
    [tokens.toString(), account]
  )

  const allowances = <any[]>useContractCalls(calls) ?? []

  return allowances.every(
    (value) => value && value.length && <BigNumber>value[0].gte(amount)
  )
}

export default useTokensHasAllowance
