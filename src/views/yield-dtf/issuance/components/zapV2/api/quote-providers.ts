import { Address } from 'viem'
import { ZapResponse, ZapResult } from '.'

const ENSO_API = 'https://api.enso.finance/api/v1/shortcuts/route'
const NATIVE_TOKEN_SENTINEL = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

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
}

const toEnsoTokenAddress = (token: Address) =>
  token.toLowerCase() === ZERO_ADDRESS ? NATIVE_TOKEN_SENTINEL : token

const isNativeToken = (token: Address) =>
  token.toLowerCase() === ZERO_ADDRESS ||
  token.toLowerCase() === NATIVE_TOKEN_SENTINEL

const buildEnsoEndpoint = ({
  chainId,
  signer,
  tokenIn,
  tokenOut,
  amountIn,
}: Pick<
  FetchZapQuoteParams,
  'chainId' | 'signer' | 'tokenIn' | 'tokenOut' | 'amountIn'
>) => {
  const params = new URLSearchParams({
    chainId: String(chainId),
    fromAddress: signer,
    tokenIn: toEnsoTokenAddress(tokenIn),
    tokenOut: toEnsoTokenAddress(tokenOut),
    amountIn,
  })

  return `${ENSO_API}?${params.toString()}`
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

const normalizeReserveResponse = (raw: unknown): ZapResponse => {
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
    error: 'Unexpected Reserve zapper response format',
  }
}

const normalizeEnsoResponse = ({
  raw,
  tokenIn,
  tokenOut,
  amountIn,
}: {
  raw: unknown
  tokenIn: Address
  tokenOut: Address
  amountIn: string
}): ZapResponse => {
  if (!raw || typeof raw !== 'object') {
    return { status: 'error', error: 'Empty Enso response' }
  }

  const payload = raw as Record<string, unknown>
  const tx = payload.tx as Record<string, unknown> | undefined

  if (!tx || !tx.to || !tx.data) {
    return { status: 'error', error: 'Enso quote missing transaction' }
  }

  const spender = String(tx.to) as Address

  const result: ZapResult = {
    tokenIn,
    amountIn,
    amountInValue: null,

    tokenOut,
    amountOut: String(payload.amountOut ?? 0),
    amountOutValue: null,
    minAmountOut:
      payload.minAmountOut !== undefined
        ? String(payload.minAmountOut)
        : undefined,

    approvalAddress: spender,
    approvalNeeded: !isNativeToken(tokenIn),
    insufficientFunds: false,

    dust: [],
    dustValue: 0,

    gas: payload.gas !== undefined ? String(payload.gas) : null,
    priceImpact: Number(payload.priceImpact) || 0,
    truePriceImpact: Number(payload.priceImpact) || 0,

    tx: {
      data: String(tx.data),
      to: spender,
      value: String(tx.value ?? 0),
    },
  }

  return { status: 'success', result }
}

const fetchProviderQuote = async ({
  provider,
  url,
  tokenIn,
  tokenOut,
  amountIn,
}: {
  provider: ZapQuoteProvider
  url: string
  tokenIn: Address
  tokenOut: Address
  amountIn: string
}): Promise<ProviderQuote> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${provider} HTTP ${response.status}`)
  }

  const raw = await response.json()
  const standardResponse =
    provider === 'reserve'
      ? normalizeReserveResponse(raw)
      : normalizeEnsoResponse({ raw, tokenIn, tokenOut, amountIn })

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
  const { quoteSource, reserveEndpoint, tokenIn, tokenOut, amountIn } = params

  const reserveQuote = () =>
    fetchProviderQuote({
      provider: 'reserve',
      url: reserveEndpoint,
      tokenIn,
      tokenOut,
      amountIn,
    })

  const ensoQuote = () =>
    fetchProviderQuote({
      provider: 'enso',
      url: buildEnsoEndpoint(params),
      tokenIn,
      tokenOut,
      amountIn,
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
