import ERC20 from 'abis/ERC20'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { RSR_ADDRESS } from 'utils/addresses'
import { Address, formatUnits } from 'viem'
import { useContractReads } from 'wagmi'
import {
  TokenBalanceMap,
  balancesAtom,
  chainIdAtom,
  rTokenAtom,
  walletAtom,
} from '../../atoms'

// TODO: Add zapper tokens
const balancesCallAtom = atom((get) => {
  const wallet = get(walletAtom)
  const rToken = get(rTokenAtom)
  const chainId = get(chainIdAtom)

  if (!rToken || !wallet) {
    return undefined
  }

  const tokens: [Address, number][] = [
    [rToken.address, rToken.decimals],
    [RSR_ADDRESS[chainId], 18],
    ...rToken.collaterals.map((token): [Address, number] => [
      token.address,
      token.decimals,
    ]),
  ]

  if (rToken.stToken) {
    tokens.push([rToken.stToken.address, rToken.stToken.decimals])
  }

  return {
    tokens,
    calls: tokens.map(([address]) => ({
      address,
      abi: ERC20,
      functionName: 'balanceOf',
      args: [wallet],
    })),
  }
})

export const TokenBalancesUpdater = () => {
  const { tokens, calls } = useAtomValue(balancesCallAtom) ?? {}
  const setBalances = useSetAtom(balancesAtom)

  const { data }: { data: bigint[] | undefined } = useContractReads({
    contracts: calls,
    allowFailure: false,
    watch: true,
  })

  useEffect(() => {
    if (data && tokens) {
      setBalances(
        data.reduce((prev, value, index) => {
          const [address, decimals] = tokens[index]
          prev[address] = {
            balance: formatUnits(value, decimals),
            value,
            decimals,
          }

          return prev
        }, {} as TokenBalanceMap)
      )
    }
  }, [data])

  return null
}
