import {
  useBlockNumber,
  useDebounce,
  useEthers,
  ERC20Interface,
  useContractCalls,
} from '@usedapp/core'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react-router/node_modules/@types/react'
import { useRTokenContract, useTokenContract } from '../../hooks/useContract'
import { useAppSelector } from '../hooks'

const useTokenBalances = (tokens: string[]) => {
  const { account } = useEthers()

  const calls = useMemo(() => {
    return tokens.map((address) => ({
      abi: ERC20Interface,
      address,
      method: 'balanceOf',
      args: [account],
    }))
  }, [tokens.toString(), account])

  const balances = useContractCalls(calls) ?? []

  return tokens.reduce(
    (prev, current, index) => ({ ...prev, [current]: balances[index] }),
    {}
  )
}

const Updater = () => {
  const [isLoading, setLoading] = useState(false)
  const [currentRToken, list] = useAppSelector(({ reserveTokens }) => [
    reserveTokens.current,
    reserveTokens.list,
  ])
  const { chainId, library, account } = useEthers()
  const tokenContract = useTokenContract(currentRToken ?? '', false)
  const rTokenContract = useRTokenContract(currentRToken ?? '', false)
  // Debounce block number for performance
  const blockNumber = useDebounce(useBlockNumber(), 1000)

  // useEffect(() => {
  // if ()
  // }, [blockNumber, chainId])

  // TODO: Get token list and the other logic
  // TODO: For now only fetch the current RToken
  useEffect(() => {
    if (chainId) {
    }
  }, [chainId])

  useEffect(() => {
    if (account && !isLoading) {
    }
  }, [blockNumber, account, chainId, isLoading])

  return null
}

export default Updater
