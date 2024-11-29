import ERC20 from 'abis/ERC20'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Address, formatUnits } from 'viem'
import { ZAP_EARN_POOLS } from 'views/earn/utils/constants'
import { useBalance, useContractReads } from 'wagmi'
import { TokenBalance, chainIdAtom, walletAtom } from '../../atoms'
import { poolBalancesAtom } from '../atoms'

const balancesCallAtom = atom((get) => {
  const wallet = get(walletAtom)

  if (!wallet) {
    return undefined
  }

  const tokens: [number, Address, number][] = [
    ...Object.entries(ZAP_EARN_POOLS).flatMap(([chain, value]) =>
      Object.values(value).map(
        ({ out: { address, decimals } }): [number, Address, number] => [
          Number(chain),
          address,
          decimals,
        ]
      )
    ),
  ]

  return {
    tokens: tokens ?? [],
    contracts: (tokens ?? []).map(([chainId, address]) => ({
      address,
      abi: ERC20,
      functionName: 'balanceOf',
      args: [wallet],
      chainId,
    })),
  }
})

export const PoolTokensBalancesUpdater = () => {
  const { tokens, contracts } = useAtomValue(balancesCallAtom) ?? {}
  const setBalances = useSetAtom(poolBalancesAtom)
  const wallet = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)

  const { data }: { data: bigint[] | undefined } = useContractReads({
    contracts,
    allowFailure: false,
    watch: true,
  })
  const { data: balance } = useBalance({
    address: wallet || undefined,
    chainId,
  })

  useEffect(() => {
    if (data && tokens) {
      const balances = data.reduce((prev, value, index) => {
        const [chainId, address, decimals] = tokens[index]
        prev[`${chainId}-${address}`] = {
          balance: formatUnits(value, decimals),
          value,
          decimals,
        }

        return prev
      }, {} as Record<string, TokenBalance>)

      setBalances(balances)
    }
  }, [data, tokens, balance])

  return null
}
