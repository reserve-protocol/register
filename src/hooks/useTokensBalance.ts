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
        interface: ERC20Interface,
        address,
        method: 'balanceOf',
        args: [account],
      })),
    [tokens.toString(), account, blockNumber]
  )

  const balances = <any[]>useGenericCalls(calls) ?? []

  return balances.reduce((acc, current, index) => {
    if (current && current[0]) {
      const [address, decimals] = tokens[index]
      acc[address] = parseFloat(ethers.utils.formatUnits(current[0], decimals))
    }

    return acc
  }, <StringMap>{})
}

export default useTokensBalance
