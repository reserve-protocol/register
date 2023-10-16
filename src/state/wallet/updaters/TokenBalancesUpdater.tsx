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
import { zappableTokens } from 'views/issuance/components/zap/state/zapper'


// TODO: Add zapper tokens
const balancesCallAtom = atom((get) => {
  const zapTokens = get(zappableTokens).filter(i => i.address.address !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE")
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
    ...zapTokens.map(i => ([i.address.address as Address, i.decimals] as [Address, number]))
  ];

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
