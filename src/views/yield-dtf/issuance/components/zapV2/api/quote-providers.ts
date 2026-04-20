import { RESERVE_API } from '@/utils/constants'
import { Address } from 'viem'
import { ZapResponse } from '.'

export type ZapQuoteSource = 'best' | 'zap' | 'enso'
export type ZapQuoteProvider = 'reserve' | 'enso'

export type ProviderQuote = {
  provider: ZapQuoteProvider
  response: ZapResponse
}

export type FetchZapQuoteParams = {
  quoteSource: ZapQuoteSource
  reserveEndpoint: string
  chainId: number
  signer: Address
  tokenIn: Address
  tokenOut: Address
  amountIn: string
  slippage: number
}

const buildEnsoEndpoint = ({
  chainId,
  signer,
  tokenIn,
  tokenOut,
  amountIn,
  slippage,
}: Pick<
  FetchZapQuoteParams,
  'chainId' | 'signer' | 'tokenIn' | 'tokenOut' | 'amountIn' | 'slippage'
>) => {
  const params = new URLSearchParams({
    chainId: String(chainId),
    signer,
    tokenIn,
    tokenOut,
    amountIn,
    slippage: String(slippage),
  })

  return `${RESERVE_API}enso/swap?${params.toString()}`
}

const parseBigIntOrZero = (value: unknown): bigint => {
  try {
    if (typeof value === 'bigint') return value
    if (typeof value === 'number' && Number.isFinite(value))
      return BigInt(Math.trunc(value))
    if (typeof value === 'string' && value.length > 0) return BigInt(value)
  } catch {
    return 0n
  }
  return 0n
}

const normalizeProviderResponse = (raw: unknown): ZapResponse => {
  if (
    raw &&
    typeof raw === 'object' &&
    'status' in raw &&
    ((raw as ZapResponse).status === 'success' ||
      (raw as ZapResponse).status === 'error')
  ) {
    return raw as ZapResponse
  }

  return {
    status: 'error',
    error: 'Unexpected zapper response format',
  }
}

const fetchProviderQuote = async ({
  provider,
  url,
}: {
  provider: ZapQuoteProvider
  url: string
}): Promise<ProviderQuote> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${provider} HTTP ${response.status}`)
  }

  const raw = await response.json()
  const standardResponse = normalizeProviderResponse(raw)

  if (standardResponse.status === 'error') {
    throw new Error(standardResponse.error || `${provider} returned an error`)
  }

  return { provider, response: standardResponse }
}

const pickBestQuote = (quotes: ProviderQuote[]): ProviderQuote => {
  return quotes.reduce((best, current) => {
    const bestAmount = parseBigIntOrZero(best.response.result?.amountOut)
    const currentAmount = parseBigIntOrZero(current.response.result?.amountOut)
    return currentAmount > bestAmount ? current : best
  })
}

export const fetchZapQuote = async (
  params: FetchZapQuoteParams
): Promise<{ selected: ProviderQuote; attempted: ZapQuoteProvider[] }> => {
  const { quoteSource, reserveEndpoint } = params

  const reserveQuote = () =>
    fetchProviderQuote({
      provider: 'reserve',
      url: reserveEndpoint,
    })

  const ensoQuote = () =>
    fetchProviderQuote({
      provider: 'enso',
      url: buildEnsoEndpoint(params),
    })

  if (quoteSource === 'zap') {
    return { selected: await reserveQuote(), attempted: ['reserve'] }
  }

  if (quoteSource === 'enso') {
    return { selected: await ensoQuote(), attempted: ['enso'] }
  }

  const settled = await Promise.allSettled([reserveQuote(), ensoQuote()])
  const successful = settled.flatMap((result) =>
    result.status === 'fulfilled' ? [result.value] : []
  )

  if (!successful.length) {
    const firstRejection = settled.find(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    )
    throw firstRejection?.reason ?? new Error('Unable to fetch quote')
  }

  return {
    selected: pickBestQuote(successful),
    attempted: ['reserve', 'enso'],
  }
}
