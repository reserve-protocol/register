import { useWatchReadContracts } from '@/hooks/useWatchReadContract'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFBasketAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Address, erc20Abi } from 'viem'
import { inputTokenAtom } from '../atoms'

export type WizardBalance = { token: Token; value: bigint }

// Wallet balances for the tokens the wizard cares about: the DTF share token,
// the input/output token, and every basket collateral. The global balancesAtom
// only tracks RSR + ZAP_TOKENS (+ yield-DTF rToken) — on an Index DTF page it
// has neither the DTF share token nor arbitrary collaterals, so we read them
// here directly, block-refreshed (updates after a mint/redeem completes).
export function useWizardBalances(): {
  byAddress: Record<string, WizardBalance>
  balanceOf: (address?: string) => bigint
  isLoading: boolean
} {
  const account = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const basket = useAtomValue(indexDTFBasketAtom)

  const tokens = useMemo<Token[]>(() => {
    const byAddress = new Map<string, Token>()
    if (indexDTF) {
      byAddress.set(indexDTF.id.toLowerCase(), {
        address: indexDTF.id,
        symbol: indexDTF.token.symbol,
        name: indexDTF.token.name,
        decimals: indexDTF.token.decimals,
      })
    }
    byAddress.set(inputToken.address.toLowerCase(), inputToken)
    for (const token of basket ?? []) {
      byAddress.set(token.address.toLowerCase(), token)
    }
    return [...byAddress.values()]
  }, [indexDTF, inputToken, basket])

  const { data, isLoading } = useWatchReadContracts({
    contracts: tokens.map((token) => ({
      address: token.address as Address,
      abi: erc20Abi,
      functionName: 'balanceOf' as const,
      args: [account as Address],
      chainId,
    })),
    allowFailure: true,
    query: { enabled: !!account && tokens.length > 0 },
  })

  return useMemo(() => {
    const byAddress: Record<string, WizardBalance> = {}
    tokens.forEach((token, index) => {
      const result = data?.[index]
      const value =
        result && result.status === 'success' ? (result.result as bigint) : 0n
      byAddress[token.address.toLowerCase()] = { token, value }
    })
    const balanceOf = (address?: string) =>
      address ? (byAddress[address.toLowerCase()]?.value ?? 0n) : 0n
    return { byAddress, balanceOf, isLoading }
  }, [tokens, data, isLoading])
}
