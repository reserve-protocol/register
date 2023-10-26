import ERC20 from 'abis/ERC20'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { RSR_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'
import { Address, formatUnits } from 'viem'
import { useBalance, useContractReads } from 'wagmi'
import {
  TokenBalanceMap,
  balancesAtom,
  chainIdAtom,
  rTokenAtom,
  walletAtom,
} from '../../atoms'

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
}

ZAP_TOKENS[ChainId.Hardhat] = ZAP_TOKENS[ChainId.Mainnet]

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
    ...ZAP_TOKENS[chainId],
  ]

  if (rToken.stToken) {
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
