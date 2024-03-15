import { Address } from 'viem'

const BASE_ZAP_API_URL =
  'https://worker-summer-silence-5553.mig2151.workers.dev'

type ZapResult = {
  amountIn: string
  tokenIn: string

  tokenOut: string
  amountOut: string

  dust: {
    token: string
    amount: string
  }[]

  gas: string
  priceImpact: number // 0.0% => no impact | 10 => 10% impact
  tx: {
    data: string
    to: string
    value: string
  }
}

export type ZapResponse = {
  status: 'success' | 'error'
  result?: ZapResult
  error?: string
}

export const fetcher = (url: string) => fetch(url).then((res) => res.json())

const zapper = {
  zap: (
    chainId: number,
    signer: Address,
    tokenIn: Address,
    amountIn: string,
    tokenOut: Address,
    slippage: number
  ) =>
    `${BASE_ZAP_API_URL}/?chainId=${chainId}&signer=${signer}&tokenIn=${tokenIn}&amountIn=${amountIn}&tokenOut=${tokenOut}&slippage=${slippage}`,
}

export default zapper
