import { useERC20Balances } from '@/hooks/useERC20Balance'
import { RSR_ADDRESS } from '@/utils/addresses'
import { rsrBalancesAtom } from '../atoms'
import { useSetAtom } from 'jotai'
import { Chain } from 'viem'
import { useEffect } from 'react'

const RSRBalancesUpdater = () => {
  const setRSRBalances = useSetAtom(rsrBalancesAtom)
  const { data: rsrBalances } = useERC20Balances(
    Object.entries(RSR_ADDRESS).map(([chainId, address]) => ({
      address,
      chainId: Number(chainId),
    }))
  )

  useEffect(() => {
    const balances = Object.entries(RSR_ADDRESS)
      .map(([chainId], index) => ({
        chainId: Number(chainId),
        balance: (rsrBalances?.[index] as bigint) ?? 0n,
      }))
      .reduce(
        (acc, { chainId, balance }) => {
          acc[chainId] = balance
          return acc
        },
        {} as Record<Chain['id'], bigint>
      )

    setRSRBalances(balances)
  }, [rsrBalances])

  return null
}

export default RSRBalancesUpdater
