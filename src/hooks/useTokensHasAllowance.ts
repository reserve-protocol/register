import { useMemo } from 'react'
import {
  useContractCalls,
  useEthers,
  ERC20Interface,
  useDebounce,
  useBlockNumber,
} from '@usedapp/core'
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
  const { account, chainId } = useEthers()
  const blockNumber = useDebounce(useBlockNumber(), 1000)

  const calls = useMemo(
    () =>
      tokens.map((address) => ({
        abi: ERC20Interface,
        address,
        method: 'allowance',
        args: [account, spender],
      })),
    [tokens.toString(), account, chainId, blockNumber]
  )

  const allowances = <any[]>useContractCalls(calls) ?? []

  return (
    allowances.length &&
    allowances.every(
      (value) => value && value.length && <BigNumber>value[0].gte(amount)
    )
  )
}

export default useTokensHasAllowance
