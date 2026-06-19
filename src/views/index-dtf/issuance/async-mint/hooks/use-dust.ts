import { Token } from '@/types'
import {
  AsyncZapQuote,
  fetchTokenPrices,
  TokenInfo,
  TokenPrice,
} from '@reserve-protocol/async-zap-sdk'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address, erc20Abi, formatUnits } from 'viem'
import { useReadContracts } from 'wagmi'

export type DustItem = {
  token: TokenInfo
  amount: number
  usd: number
}

export function getDustTokens(
  quote: AsyncZapQuote | undefined,
  inputTokenAddress: string
): TokenInfo[] {
  if (!quote) return []

  const byAddress = new Map<string, TokenInfo>()
  for (const fa of quote.folioAssets) {
    // The input/output token is never dust: for redeem it's the expected
    // output, for mint it's the separately-shown unused budget. Skip it even
    // when it's a basket collateral.
    if (fa.asset.address.toLowerCase() === inputTokenAddress.toLowerCase()) {
      continue
    }
    byAddress.set(fa.asset.address.toLowerCase(), fa.asset)
  }
  return [...byAddress.values()]
}

export function calculateDust({
  tokens,
  currentBalances,
  startBalances,
  prices,
}: {
  tokens: TokenInfo[]
  currentBalances: Record<string, bigint>
  startBalances: Record<string, bigint>
  prices: TokenPrice[]
}): { items: DustItem[]; totalUsd: number } {
  const items: DustItem[] = []
  let totalUsd = 0
  tokens.forEach((t) => {
    const address = t.address.toLowerCase()
    const current = currentBalances[address] ?? 0n
    const start = startBalances[address] ?? 0n
    const dust = current > start ? current - start : 0n
    if (dust === 0n) return

    const amount = Number(formatUnits(dust, t.decimals))
    const price =
      prices.find((p) => p.address.toLowerCase() === address)?.price ?? 0
    const usd = amount * price
    items.push({ token: t, amount, usd })
    totalUsd += usd
  })
  return { items, totalUsd }
}

// Computes leftover dust after an async mint/redeem by diffing the user's
// current balances against the snapshot captured before execution. The SDK
// uses sell orders, so swap outputs don't match basket proportions exactly and
// some residue stays in the wallet.
export function useDust({
  quote,
  startBalances,
  account,
  chainId,
  inputToken,
}: {
  quote: AsyncZapQuote | undefined
  startBalances: Record<string, bigint>
  account: Address | undefined
  chainId: number
  inputToken: Token
}): { items: DustItem[]; totalUsd: number } {
  const tokens = useMemo<TokenInfo[]>(() => {
    return getDustTokens(quote, inputToken.address)
  }, [quote, inputToken])

  const { data: balanceData } = useReadContracts({
    contracts: tokens.map((t) => ({
      address: t.address,
      abi: erc20Abi,
      functionName: 'balanceOf' as const,
      args: [account as Address] as const,
      chainId,
    })),
    query: { enabled: !!account && tokens.length > 0 },
  })

  const queryClient = useQueryClient()
  const { data: prices } = useQuery({
    queryKey: [
      'async-mint/dust-prices',
      chainId,
      tokens.map((t) => t.address).join(','),
    ],
    queryFn: () =>
      fetchTokenPrices(
        queryClient,
        tokens.map((t) => ({ chainId, tokenAddress: t.address }))
      ),
    enabled: tokens.length > 0,
  })

  return useMemo(() => {
    const currentBalances: Record<string, bigint> = {}
    tokens.forEach((t, i) => {
      const result = balanceData?.[i]?.result as bigint | undefined
      currentBalances[t.address.toLowerCase()] = result ?? 0n
    })

    return calculateDust({
      tokens,
      currentBalances,
      startBalances,
      prices: prices ?? [],
    })
  }, [tokens, balanceData, startBalances, prices])
}
