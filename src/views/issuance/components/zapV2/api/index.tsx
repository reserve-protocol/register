import { Address } from 'viem'

const BASE_ZAP_API_URL = 'https://zapper-api.reserve.org'
const BASE_ZAP_MULTISEARCH_API_URL = 'https://zapper-api-stage.reserve.org'

export type ZapPayload = {
  chainId: number
  tokenIn: Address
  tokenOut: Address
  amountIn: string
  slippage: number
  signer: Address
  trade: boolean
  multiSearch?: boolean
}

export type ZapResult = {
  tokenIn: string
  amountIn: string
  amountInValue: number | null

  tokenOut: string
  amountOut: string
  amountOutValue: number | null

  approvalAddress: Address
  approvalNeeded: boolean
  insufficientFunds: boolean

  dust: {
    token: string
    amount: string
  }[]
  dustValue: number | null

  gas: string | null
  priceImpact: number // 0.0% => no impact | 10 => 10% impact
  tx: {
    data: string
    to: Address
    value: string
  } | null
}

export type ZapResponse = {
  status: 'success' | 'error'
  result?: ZapResult
  error?: string
}

export const fetcher = (url: string) => fetch(url).then((res) => res.json())

const getBaseZapUrl = (multiSearch = false) => {
  return multiSearch ? BASE_ZAP_MULTISEARCH_API_URL : BASE_ZAP_API_URL
}

const zapper = {
  zap: ({
    chainId,
    tokenIn,
    tokenOut,
    amountIn,
    slippage,
    signer,
    trade,
    multiSearch,
  }: ZapPayload) =>
    `${getBaseZapUrl(multiSearch)}/?chainId=${chainId}&signer=${signer}&tokenIn=${tokenIn}&amountIn=${amountIn}&tokenOut=${tokenOut}&slippage=${slippage}&trade=${trade}`,
}

export default zapper
