import { useWatchReadContracts } from '../../hooks/use-watch-read-contracts'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Address, erc20Abi, formatUnits } from 'viem'
import { useBalance } from 'wagmi'
import {
  balancesAtom,
  chainIdAtom,
  indexDTFAtom,
  walletAtom,
} from '../../state/atoms'
import { TokenBalance } from '../../types'
import { reducedZappableTokens } from '../../utils/constants'
import { indexDTFBalanceAtom } from '../zap-mint/atom'

const balancesCallAtom = atom((get) => {
  const wallet = get(walletAtom)
  const chainId = get(chainIdAtom)
  const indexDTF = get(indexDTFAtom)

  if (!wallet) {
    return undefined
  }

  const tokens: [Address, number][] = reducedZappableTokens[chainId]
    .slice(1)
    .map((token) => [token.address, token.decimals])

  if (indexDTF) {
    tokens.unshift([indexDTF.id, indexDTF.token.decimals])
  }

  return {
    tokens: tokens ?? [],
    calls: (tokens ?? []).map(([address]) => ({
      address,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [wallet],
      chainId,
    })),
  }
})

export const TokenBalancesUpdater = ({
  dtfAddress,
}: {
  dtfAddress: string
}) => {
  const { tokens, calls } = useAtomValue(balancesCallAtom) ?? {}
  const setBalances = useSetAtom(balancesAtom)
  const setIndexDTFBalance = useSetAtom(indexDTFBalanceAtom)
  const wallet = useAtomValue(walletAtom)

  const { data }: { data: bigint[] | undefined } = useWatchReadContracts({
    contracts: calls,
    allowFailure: false,
  })
  const { data: balance } = useBalance({
    address: wallet || undefined,
  })

  useEffect(() => {
    if (data && tokens) {
      const balances = data.reduce(
        (prev, value, index) => {
          const [address, decimals] = tokens[index]
          prev[address] = {
            balance: formatUnits(value, decimals),
            value,
            decimals,
          }

          return prev
        },
        {} as Record<string, TokenBalance>
      )

      balances['0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'] = {
        balance: balance ? balance.formatted : '0',
        value: balance ? balance.value : 0n,
        decimals: 18,
      }

      setBalances(balances)
      setIndexDTFBalance(balances[dtfAddress]?.value || 0n)
    }
  }, [data, balance, dtfAddress, setBalances, setIndexDTFBalance])

  return null
}

export default TokenBalancesUpdater
