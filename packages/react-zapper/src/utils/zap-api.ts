import { Address } from 'viem'

// Default API URL - can be overridden via config
const DEFAULT_API_URL = 'https://api.reserve.org/'

// Global variable to store custom API URL
let CUSTOM_API_URL: string | undefined = undefined

// Function to set custom API URL
export const setCustomApiUrl = (apiUrl?: string) => {
  CUSTOM_API_URL = apiUrl
}

// Function to get current API URL
const getApiUrl = () => CUSTOM_API_URL || DEFAULT_API_URL

const getBaseZapApiUrl = () => getApiUrl() + 'zapper'

export interface ZapResult {
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

export interface ZapResponse {
  status: 'success' | 'error'
  result?: ZapResult
  error?: string
}

export interface ZapParams {
  chainId: number
  tokenIn: Address
  tokenOut: Address
  amountIn: string
  slippage: number
  signer: Address
  trade?: boolean
  bypassCache?: boolean
}

/**
 * Zap API client for Reserve Protocol
 * Provides URL generation and API interaction for zap swaps
 */
class ZapApi {
  private baseUrl: string

  constructor(baseUrl: string = getBaseZapApiUrl()) {
    this.baseUrl = baseUrl
  }

  /**
   * Build zap URL for quote/swap
   */
  zap(params: ZapParams): string {
    const {
      chainId,
      tokenIn,
      tokenOut,
      amountIn,
      slippage,
      signer,
      trade = true,
      bypassCache = false,
    } = params
    return `${this.baseUrl}/swap?chainId=${chainId}&signer=${signer}&tokenIn=${tokenIn}&amountIn=${amountIn}&tokenOut=${tokenOut}&slippage=${slippage}&trade=${trade}&bypassCache=${bypassCache}`
  }

  /**
   * Build old zap URL for backwards compatibility
   */
  oldZap(params: ZapParams): string {
    const {
      chainId,
      tokenIn,
      tokenOut,
      amountIn,
      slippage,
      signer,
      trade = true,
    } = params
    return `${this.baseUrl}/swap?chainId=${chainId}&signer=${signer}&tokenIn=${tokenIn}&amountIn=${amountIn}&tokenOut=${tokenOut}&slippage=${slippage}&trade=${trade}`
  }

  /**
   * Execute a zap swap
   */
  async executeZap(params: ZapParams): Promise<ZapResponse> {
    const url = this.zap(params)

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data as ZapResponse
    } catch (error) {
      return {
        status: 'error',
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  /**
   * Get zap deploy URL
   */
  zapDeploy(chainId: number): string {
    return `${this.baseUrl}/deploy-zap?chainId=${chainId}`
  }

  /**
   * Get zap deploy ungoverned URL
   */
  zapDeployUngoverned(chainId: number): string {
    return `${this.baseUrl}/deploy-ungoverned-zap?chainId=${chainId}`
  }
}

// Default export singleton
const zapper = new ZapApi()
export default zapper

export { ZapApi }

// Helper function for fetch operations
export const fetcher = (url: string) => fetch(url).then((res) => res.json())
