import { ChainId } from '@/utils/chains'
import { RESERVE_API } from '@/utils/constants'
import { Address } from 'viem'
import { readZapError, ZapResponse } from '.'

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

class ProviderHttpError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
  }
}

export const isClientError = (error: unknown) =>
  error instanceof ProviderHttpError &&
  error.status >= 400 &&
  error.status < 500

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
    throw new ProviderHttpError(
      (await readZapError(response)) || `${provider} HTTP ${response.status}`,
      response.status
    )
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

  // The Rust zapper doesn't serve Arbitrum
  if (quoteSource === 'enso' || params.chainId === ChainId.Arbitrum) {
    return { selected: await ensoQuote(), attempted: ['enso'] }
  }

  if (quoteSource === 'zap') {
    return { selected: await reserveQuote(), attempted: ['reserve'] }
  }

  const settled = await Promise.allSettled([reserveQuote(), ensoQuote()])
  const successful = settled.flatMap((result) =>
    result.status === 'fulfilled' ? [result.value] : []
  )

  if (!successful.length) {
    const rejections = settled.flatMap((result) =>
      result.status === 'rejected' ? [result.reason] : []
    )
    // A 4xx only stops retries when every provider answered with one
    throw (
      rejections.find((reason) => !isClientError(reason)) ??
      rejections[0] ??
      new Error('Unable to fetch quote')
    )
  }

  return {
    selected: pickBestQuote(successful),
    attempted: ['reserve', 'enso'],
  }
}
