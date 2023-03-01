import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import { useWeb3React } from '@web3-react/core'
import { ERC20Interface } from 'abis'
import { useMemo } from 'react'
import { BalanceMap, ReserveToken } from 'types'
import { CHAIN_ID } from 'utils/chains'
import { RSR } from 'utils/constants'
import { useContractCalls } from './useCall'
import useRToken from './useRToken'

// Gets ReserveToken related token addresses and decimals
const getTokens = (reserveToken: ReserveToken): [string, number][] => {
  const addresses: [string, number][] = [
    [reserveToken.address, reserveToken.decimals],
    [RSR.address, RSR.decimals],
    ...reserveToken.collaterals.map((token): [string, number] => [
      token.address,
      token.decimals,
    ]),
  ]

  if (reserveToken.stToken) {
    addresses.push([
      reserveToken.stToken.address,
      reserveToken.stToken.decimals,
    ])
  }

  return addresses
}

/**
 * Returns a hash of balances for the given tokens
 */
const useTokensBalance = (): BalanceMap => {
  const rToken = useRToken()
  const { chainId, account } = useWeb3React()
  const tokens =
    rToken && account && CHAIN_ID === chainId ? getTokens(rToken) : []

  const calls = useMemo(() => {
    return tokens.map(([address]) => ({
      abi: ERC20Interface,
      address,
      method: 'balanceOf',
      args: [account],
    }))
  }, [tokens.toString(), account])

  const balances = <any[]>useContractCalls(calls) ?? []

  return useMemo(() => {
    return balances.reduce((acc, current, index) => {
      const [address, decimals] = tokens[index]
      if (current?.value) {
        acc[address] = {
          value: current.value[0],
          decimals,
          balance: formatUnits(current.value[0], decimals),
        }
      } else {
        acc[address] = {
          value: BigNumber.from(0),
          decimals,
          balance: '0',
        }
      }

      return acc
    }, <BalanceMap>{})
  }, [JSON.stringify(balances)])
}

export default useTokensBalance
