import { useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { Address, parseUnits } from 'viem'
import { basketAtom } from '../../../atoms'
import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import { PriceControl } from '@reserve-protocol/dtf-rebalance-lib'
import zapper from '@/views/yield-dtf/issuance/components/zapV2/api'
import {
  liquidityCheckStatusAtom,
  liquiditySimulationAmountAtom,
  tokenLiquidityMapAtom,
  TokenLiquidity,
} from '../atoms'
import { priceImpactToLevel, priceImpactToScore } from '../utils/liquidity'

export const LIQUIDITY_CHECK_TOKEN: Record<number, { address: Address; symbol: string; decimals: number }> = {
  1: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', decimals: 6 }, // Mainnet
  8453: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', symbol: 'USDC', decimals: 6 }, // Base
  56: { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', decimals: 18 }, // BSC
}

export const getLiquidityCheckTokenSymbol = (chainId: number): string => {
  return LIQUIDITY_CHECK_TOKEN[chainId]?.symbol || 'USDC'
}

interface PriceImpactStat {
  action: string
  inputToken: string[]
  outputToken: string[]
  impact: number
  success: boolean
}

interface LiquidityCheckResponse {
  status: 'success' | 'error'
  result?: {
    debug?: {
      priceImpactStats?: PriceImpactStat[]
    }
  }
  error?: string
}

const buildLiquidityCheckPayload = (basket: Token[], chainId: number, amountPerToken: number) => {
  const totalAmountUsd = amountPerToken * basket.length
  const inputToken = LIQUIDITY_CHECK_TOKEN[chainId] || LIQUIDITY_CHECK_TOKEN[1]

  return {
    debug: true,
    tokenIn: inputToken.address,
    amountIn: parseUnits(totalAmountUsd.toString(), inputToken.decimals).toString(),
    signer: "0x8e0507C16435Caca6CB71a7Fb0e0636fd3891df4" as Address,
    slippage: 0.01,
    owner: "0x0000000000000000000000000000000000000001" as Address,
    basicDetails: {
      name: 'LiquidityCheck',
      symbol: 'LC',
      assets: basket.map((token) => token.address),
      amounts: basket.map((token) => {
        const price = token.price && token.price > 0 ? token.price : 1
        const tokenAmount = amountPerToken / price
        const decimals = token.decimals || 18
        return parseUnits(tokenAmount.toFixed(decimals), decimals).toString()
      }),
    },
    additionalDetails: {
      auctionLength: '1800',
      feeRecipients: [],
      tvlFee: '0',
      mintFee: '0',
      mandate: '',
    },
    folioFlags: {
      trustedFillerEnabled: true,
      bidsEnabled: true,
      rebalanceControl: {
        weightControl: true,
        priceControl: PriceControl.PARTIAL,
      },
    },
    basketManagers: [] as Address[],
    auctionLaunchers: [] as Address[],
    brandManagers: [] as Address[],
  }
}

const extractNoPathTokenAddress = (error: string): string | null => {
  const match = error.match(/No path found.*\((0x[a-fA-F0-9]{40})\)/)
  return match ? match[1].toLowerCase() : null
}

const fetchLiquidityData = async (
  basket: Token[],
  chainId: number,
  amountPerToken: number
): Promise<Record<string, TokenLiquidity>> => {
  const url = `${zapper.zapDeployUngoverned(chainId)}`
  const payload = buildLiquidityCheckPayload(basket, chainId, amountPerToken)

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data: LiquidityCheckResponse = await response.json()

  if (data.status === 'error' && data.error) {
    const noPathAddress = extractNoPathTokenAddress(data.error)
    const result: Record<string, TokenLiquidity> = {}

    for (const token of basket) {
      const address = token.address.toLowerCase()
      if (noPathAddress && address === noPathAddress) {
        result[address] = {
          address: token.address,
          priceImpact: 100,
          liquidityLevel: 'insufficient',
          liquidityScore: 0,
        }
      } else if (noPathAddress) {
        result[address] = {
          address: token.address,
          priceImpact: 0,
          liquidityLevel: 'unknown',
          liquidityScore: 50,
        }
      } else {
        result[address] = {
          address: token.address,
          priceImpact: 0,
          liquidityLevel: 'failed',
          liquidityScore: 0,
        }
      }
    }
    return result
  }

  const priceImpactStats = data.result?.debug?.priceImpactStats || []
  const result: Record<string, TokenLiquidity> = {}

  for (const token of basket) {
    const address = token.address.toLowerCase()

    // Find swaps where this token is in the outputToken array
    const relevantSwaps = priceImpactStats.filter((stat) =>
      stat.outputToken.some((out) => out.toLowerCase() === address)
    )

    // Sum up the impacts (they can be positive or negative)
    const totalImpact = relevantSwaps.reduce((sum, stat) => sum + (stat.impact || 0), 0)
    // Convert to percentage (impact comes as decimal like 0.003 = 0.3%)
    const priceImpact = totalImpact * 100

    result[address] = {
      address: token.address,
      priceImpact,
      liquidityLevel: priceImpactToLevel(priceImpact),
      liquidityScore: priceImpactToScore(priceImpact),
    }
  }

  return result
}

export const useLiquidityCheck = () => {
  const basket = useAtomValue(basketAtom)
  const chainId = useAtomValue(chainIdAtom)
  const simulationAmount = useAtomValue(liquiditySimulationAmountAtom)
  const setStatus = useSetAtom(liquidityCheckStatusAtom)
  const setLiquidityMap = useSetAtom(tokenLiquidityMapAtom)

  const queryKey = useMemo(
    () => ['liquidity-check', chainId, simulationAmount, basket.map((t) => t.address).sort().join(',')],
    [chainId, simulationAmount, basket]
  )

  const allTokensHavePrices = basket.every((t) => t.price && t.price > 0)

  const query = useQuery({
    queryKey,
    queryFn: () => fetchLiquidityData(basket, chainId, simulationAmount),
    enabled: basket.length >= 1 && allTokensHavePrices,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })

  useEffect(() => {
    if (query.isLoading || query.isFetching) {
      setStatus('loading')
    } else if (query.isError) {
      setStatus('error')
      // Set all tokens to 'failed' when the request fails
      const failedMap: Record<string, TokenLiquidity> = {}
      for (const token of basket) {
        failedMap[token.address.toLowerCase()] = {
          address: token.address,
          priceImpact: 0,
          liquidityLevel: 'failed',
          liquidityScore: 0,
        }
      }
      setLiquidityMap(failedMap)
    } else if (query.isSuccess) {
      setStatus('success')
      setLiquidityMap(query.data)
    } else {
      setStatus('idle')
    }
  }, [query.isLoading, query.isFetching, query.isError, query.isSuccess, query.data, setStatus, setLiquidityMap, basket])

  return query
}
