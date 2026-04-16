import { Address } from 'viem'
import { ZapResponse, ZapResult } from '@/views/yield-dtf/issuance/components/zapV2/api'

const ENSO_API = 'https://api.enso.finance/api/v1/shortcuts/route'
const RETRY_ATTEMPTS = 3

type ZapProvider = 'reserve' | 'enso'

type ProviderQuote = {
  provider: ZapProvider
  raw: unknown
  response: ZapResponse
}

type FetchBestZapQuoteParams = {
  reserveEndpoint: string
  chainId: number
  signer: Address
  tokenIn: Address
  tokenOut: Address
  amountIn: string
}

const getEnsoTokenAddress = (token: Address) =>
  token.toLowerCase() === '0x0000000000000000000000000000000000000000'
    ? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    : token

const buildEnsoEndpoint = ({
  chainId,
  signer,
  tokenIn,
  tokenOut,
  amountIn,
}: Omit<FetchBestZapQuoteParams, 'reserveEndpoint'>) => {
  const params = new URLSearchParams({
    chainId: String(chainId),
    fromAddress: signer,
    tokenIn: getEnsoTokenAddress(tokenIn),
    tokenOut: getEnsoTokenAddress(tokenOut),
    amountIn,
  })

  return `${ENSO_API}?${params.toString()}`
}

const parseNumber = (value: unknown) => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const parseBigInt = (value: unknown) => {
  try {
    if (typeof value === 'bigint') return value
    if (typeof value === 'number') return BigInt(Math.trunc(value))
    if (typeof value === 'string') return BigInt(value)
  } catch {
    return 0n
  }

  return 0n
}

const getQuoteScore = (quote?: ZapResult) => {
  if (!quote) return 0n

  const valueScore = parseNumber(quote.amountOutValue)
  if (valueScore > 0) {
    return BigInt(Math.round(valueScore * 1_000_000))
  }

  return parseBigInt(quote.amountOut)
}

const pickBestQuote = (quotes: ProviderQuote[]) => {
  const successful = quotes.filter(
    (quote) => quote.response.status === 'success' && quote.response.result
  )

  if (!successful.length) {
    return quotes[0]
  }

  return successful.reduce((best, current) =>
    getQuoteScore(current.response.result) > getQuoteScore(best.response.result)
      ? current
      : best
  )
}

const toStandardZapResponse = ({
  provider,
  payload,
  tokenIn,
  tokenOut,
  amountIn,
}: {
  provider: ZapProvider
  payload: unknown
  tokenIn: Address
  tokenOut: Address
  amountIn: string
}): ZapResponse => {
  if (
    payload &&
    typeof payload === 'object' &&
    'status' in payload &&
    ((payload as ZapResponse).status === 'success' ||
      (payload as ZapResponse).status === 'error')
  ) {
    return payload as ZapResponse
  }

  if (provider === 'enso' && payload && typeof payload === 'object') {
    const raw = payload as Record<string, unknown>
    const tx = (raw.txData || raw.tx || raw.transaction) as
      | Record<string, unknown>
      | undefined

    if (!tx) {
      return { status: 'error', error: 'Enso quote missing tx payload' }
    }

    const normalized: ZapResult = {
      tokenIn,
      amountIn,
      amountInValue: parseNumber(raw.amountInUsd || raw.amountInValue) || null,
      tokenOut,
      amountOut: String(raw.amountOut || raw.amountOutWei || 0),
      amountOutValue:
        parseNumber(raw.amountOutUsd || raw.amountOutValue || raw.toAmountUsd) ||
        null,
      minAmountOut:
        raw.minAmountOut !== undefined ? String(raw.minAmountOut) : undefined,
      approvalAddress: String(
        raw.approvalTarget || raw.approvalAddress || tx.to || tokenIn
      ) as Address,
      approvalNeeded: Boolean(raw.approvalTarget || raw.approvalAddress),
      insufficientFunds: false,
      dust: [],
      dustValue: 0,
      gas: raw.gas ? String(raw.gas) : null,
      priceImpact: parseNumber(raw.priceImpact),
      truePriceImpact: parseNumber(raw.priceImpact),
      tx: {
        data: String(tx.data || '0x'),
        to: String(tx.to || '') as Address,
        value: String(tx.value || 0),
      },
    }

    if (!normalized.tx.to || normalized.tx.to === '0x') {
      return { status: 'error', error: 'Enso quote missing transaction target' }
    }

    return {
      status: 'success',
      result: normalized,
    }
  }

  return {
    status: 'error',
    error: `Unexpected ${provider} response format`,
  }
}

const fetchProviderQuote = async ({
  provider,
  url,
  tokenIn,
  tokenOut,
  amountIn,
}: {
  provider: ZapProvider
  url: string
  tokenIn: Address
  tokenOut: Address
  amountIn: string
}): Promise<ProviderQuote> => {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const payload = await response.json()
      const standardResponse = toStandardZapResponse({
        provider,
        payload,
        tokenIn,
        tokenOut,
        amountIn,
      })

      if (standardResponse.status === 'error') {
        throw new Error(standardResponse.error || `${provider} returned an error`)
      }

      return {
        provider,
        raw: payload,
        response: standardResponse,
      }
    } catch (error) {
      lastError = error as Error
      if (attempt === RETRY_ATTEMPTS) break
      await new Promise((resolve) => setTimeout(resolve, attempt * 300))
    }
  }

  throw lastError || new Error(`Unable to fetch ${provider} quote`)
}

export const fetchBestZapQuote = async (
  params: FetchBestZapQuoteParams
): Promise<{
  selected: ProviderQuote
  successfulQuotes: ProviderQuote[]
  comparedProviders: number
}> => {
  const ensoEndpoint = buildEnsoEndpoint(params)

  const quoteResults = await Promise.allSettled([
    fetchProviderQuote({
      provider: 'reserve',
      url: params.reserveEndpoint,
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
    }),
    fetchProviderQuote({
      provider: 'enso',
      url: ensoEndpoint,
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
    }),
  ])

  const successfulQuotes = quoteResults
    .filter(
      (result): result is PromiseFulfilledResult<ProviderQuote> =>
        result.status === 'fulfilled'
    )
    .map((result) => result.value)

  if (!successfulQuotes.length) {
    const firstError = quoteResults.find(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    )
    const message = firstError?.reason?.message || 'Unable to fetch quote'
    throw new Error(message)
  }

  return {
    selected: pickBestQuote(successfulQuotes),
    successfulQuotes,
    comparedProviders: quoteResults.length,
  }
}
