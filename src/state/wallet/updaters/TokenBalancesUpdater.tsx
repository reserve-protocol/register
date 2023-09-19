import ERC20 from 'abis/ERC20'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { RSR_ADDRESS } from 'utils/addresses'
import { Address, formatUnits } from 'viem'
import { useBalance, useContractReads } from 'wagmi'
import {
  TokenBalanceMap,
  balancesAtom,
  chainIdAtom,
  rTokenAtom,
  walletAtom,
} from '../../atoms'

const zapTokens: [Address, number][] = [
  ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6], // USDC
  ['0xdAC17F958D2ee523a2206206994597C13D831ec7', 6], // USDT
  ['0x6B175474E89094C44Da98b954EedeAC495271d0F', 18], // DAI
  ['0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8], // WBTC
  ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18], // WETH
  ['0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3', 18], // MIM
  ['0x853d955aCEf822Db058eb8505911ED77F175b99e', 18], // FRAX
]

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
    ...zapTokens,
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
  const wallet = useAtomValue(walletAtom)

  const { data }: { data: bigint[] | undefined } = useContractReads({
    contracts: calls,
    allowFailure: false,
    watch: true,
  })
  const { data: balance } = useBalance({
    address: wallet || undefined,
  })

  useEffect(() => {
    if (data && tokens) {
      const balances = data.reduce((prev, value, index) => {
        const [address, decimals] = tokens[index]
        prev[address] = {
          balance: formatUnits(value, decimals),
          value,
          decimals,
        }

        return prev
      }, {} as TokenBalanceMap)

      balances['0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'] = {
        balance: balance ? balance.formatted : '0',
        value: balance ? balance.value : 0n,
        decimals: 18,
      }

      setBalances(balances)
    }
  }, [data, balance])

  return null
}
