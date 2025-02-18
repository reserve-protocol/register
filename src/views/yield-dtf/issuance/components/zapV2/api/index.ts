import { RESERVE_API } from '@/utils/constants'
import { Address } from 'viem'

// const BASE_ZAP_API_URL = 'https://zapper-api-stage.reserve.org' // TODO: change to prod
const BASE_ZAP_API_URL = RESERVE_API + 'zapper'

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

const zapper = {
  zap: ({
    chainId,
    tokenIn,
    tokenOut,
    amountIn,
    slippage,
    signer,
    trade = true,
  }: ZapPayload) =>
    `${BASE_ZAP_API_URL}/swap?chainId=${chainId}&signer=${signer}&tokenIn=${tokenIn}&amountIn=${amountIn}&tokenOut=${tokenOut}&slippage=${slippage}&trade=${trade}`,

  zapDeploy: (chainId: number) =>
    `${BASE_ZAP_API_URL}/deploy-zap?chainId=${chainId}`,

  zapDeployUngoverned: (chainId: number) =>
    `${BASE_ZAP_API_URL}/deploy-ungoverned-zap?chainId=${chainId}`,
}

export default zapper
