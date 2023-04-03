import { formatUnits } from '@ethersproject/units'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { useMemo } from 'react'
import { useTokenBalances } from 'state/TokenBalancesUpdater'
import { BalanceMap, ReserveToken } from 'types'
import { CHAIN_ID } from 'utils/chains'
import { RSR } from 'utils/constants'
import useRToken from './useRToken'

// Gets ReserveToken related token addresses and decimals
export const getTokens = (reserveToken: ReserveToken): [string, number][] => {
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
  const tokens = useMemo(() => rToken && account && (chainId === 31337 || CHAIN_ID === chainId) ? getTokens(rToken) : [], [rToken, chainId, account])
    
  const balances = useTokenBalances(tokens.map(i => i[0]))

  return Object.fromEntries(
    balances.map((atomValue, i) => ({
      atomValue,
      decimals: tokens[i][1]
    })).map(entry => ([entry.atomValue.address, {
      value: entry.atomValue.value??ethers.constants.Zero,
      decimals: entry.decimals,
      balance: formatUnits(
        entry.atomValue.value??ethers.constants.Zero,
        entry.decimals
      )
    }]))
  )
}

export default useTokensBalance
