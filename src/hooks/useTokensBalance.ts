import { useWeb3React } from '@web3-react/core'
import { StringMap } from 'types'
import { useMemo } from 'react'
import { ethers } from 'ethers'
import { ERC20Interface } from 'abis'
import { useGenericCalls } from './useCall'
import useBlockNumber from './useBlockNumber'

/**
 * Returns a hash of balances for the given tokens
 *
 * @param tokens
 * @returns
 */
const useTokensBalance = (tokens: [string, number][]): StringMap => {
  const { account } = useWeb3React()
  const blockNumber = useBlockNumber()

  const calls = useMemo(
    () =>
      tokens.map(([address]) => ({
        abi: ERC20Interface,
        address,
        method: 'balanceOf',
        args: [account],
      })),
    [tokens.toString(), account, blockNumber]
  )

  const balances = <any[]>useGenericCalls(calls) ?? []

  return balances.reduce((acc, current, index) => {
    const [address, decimals] = tokens[index]
    if (current?.value) {
      acc[address] = parseFloat(
        ethers.utils.formatUnits(current.value[0], decimals)
      )
    } else {
      acc[address] = 0
    }

    return acc
  }, <StringMap>{})
}

export default useTokensBalance
