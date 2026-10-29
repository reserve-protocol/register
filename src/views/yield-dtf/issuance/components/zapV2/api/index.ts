import { ZAPPER_API } from '@/utils/constants'
import { Address } from 'viem'

const getBaseZapApiUrl = (chain: number) => ZAPPER_API + `api/zapper/${chain}`

export type ZapPayload = {
  chainId: number
  tokenIn: Address
  tokenOut: Address
  amountIn: string
  slippage: number
  signer: Address
  trade?: boolean
}

export type ZapResult = {
  tokenIn: Address
  amountIn: string
  amountInValue: number | null

  tokenOut: Address
  amountOut: string
  amountOutValue: number | null
  minAmountOut?: string

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
  truePriceImpact: number // -10% => positive impact,  10 => 10% negative impact
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

// Rust zapper failures are a non-2xx JSON envelope, or plain text for rejected request shapes
export const readZapError = async (
  response: Response
): Promise<string | undefined> => {
  const body = await response.text().catch(() => '')
  try {
    return JSON.parse(body).error
  } catch {
    return response.headers.get('content-type')?.startsWith('text/plain')
      ? body
      : undefined
  }
}

const zapper = {
  oldZap: ({
    chainId,
    tokenIn,
    tokenOut,
    amountIn,
    slippage,
    signer,
    trade = true,
  }: ZapPayload) =>
    `${getBaseZapApiUrl(chainId)}/swap?chainId=${chainId}&signer=${signer}&tokenIn=${tokenIn}&amountIn=${amountIn}&tokenOut=${tokenOut}&slippage=${slippage}&trade=${trade}`,
  zapDeploy: (chainId: number) =>
    `${getBaseZapApiUrl(chainId)}/deploy?chainId=${chainId}`,

  zapDeployUngoverned: (chainId: number) =>
    `${getBaseZapApiUrl(chainId)}/deploy-ungoverned?chainId=${chainId}`,
}

export default zapper
