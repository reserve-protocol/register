import ERC20 from 'abis/ERC20'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { RSR_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import { Address, formatUnits } from 'viem'
import { useBalance } from 'wagmi'
import {
  TokenBalanceMap,
  balancesAtom,
  chainIdAtom,
  rTokenAtom,
  walletAtom,
} from '../../atoms'
import { useWatchReadContracts } from 'hooks/useWatchReadContract'

const ZAP_TOKENS: { [x: number]: [Address, number][] } = {
  [ChainId.Mainnet]: [
    ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6], // USDC
    ['0xdAC17F958D2ee523a2206206994597C13D831ec7', 6], // USDT
    ['0x6B175474E89094C44Da98b954EedeAC495271d0F', 18], // DAI
    ['0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8], // WBTC
    ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18], // WETH
    ['0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3', 18], // MIM
    ['0x853d955aCEf822Db058eb8505911ED77F175b99e', 6], // FRAX
  ],
  [ChainId.Base]: [
    ['0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', 6], // USDbC
    ['0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 6], // USDC
    ['0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', 18], // DAI
    ['0x4200000000000000000000000000000000000006', 18], // WETH
  ],
  [ChainId.Arbitrum]: [
    ['0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', 18], // WETH
    ['0xaf88d065e77c8cC2239327C5EDb3A432268e5831', 6], // USDC
    ['0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', 6], // USDT
    ['0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', 18], // DAI
    ['0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', 8], // WBTC
  ],
}

// TODO: Add zapper tokens
const balancesCallAtom = atom((get) => {
  const wallet = get(walletAtom)
  const rToken = get(rTokenAtom)
  const chainId = get(chainIdAtom)

  if (!wallet) {
    return undefined
  }

  const tokens: [Address, number][] = [
    [RSR_ADDRESS[chainId], 18],
    ...ZAP_TOKENS[chainId],
  ]

  if (rToken) {
    tokens.push(
      [rToken.address, rToken.decimals],
      ...rToken.collaterals.map((token): [Address, number] => [
        token.address,
        token.decimals,
      ])
    )
  }

  if (rToken?.stToken) {
    tokens.push([rToken.stToken.address, rToken.stToken.decimals])
  }

  return {
    tokens: tokens ?? [],
    calls: (tokens ?? []).map(([address]) => ({
      address,
      abi: ERC20,
      functionName: 'balanceOf',
      args: [wallet],
      chainId,
    })),
  }
})

export const TokenBalancesUpdater = () => {
  const { tokens, calls } = useAtomValue(balancesCallAtom) ?? {}
  const setBalances = useSetAtom(balancesAtom)
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
