import { Address } from 'viem'

const BASE_ZAP_API_URL =
  'https://worker-summer-silence-5553.mig2151.workers.dev'

export type ZapPayload = {
  chainId: number
  tokenIn: Address
  tokenOut: Address
  amountIn: string
  slippage: number
  signer: Address
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
  insuficientFunds: boolean

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

const zapper = {
  zap: ({
    chainId,
    tokenIn,
    tokenOut,
    amountIn,
    slippage,
    signer,
  }: ZapPayload) =>
    `${BASE_ZAP_API_URL}/?chainId=${chainId}&signer=${signer}&tokenIn=${tokenIn}&amountIn=${amountIn}&tokenOut=${tokenOut}&slippage=${slippage}`,
}

export default zapper
