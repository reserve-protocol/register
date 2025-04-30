export type AsyncSwapQuote = {
  token: string
  symbol: string
  quote: {
    quote: {
      sellToken: string
      buyToken: string
      receiver: string
      sellAmount: string
      buyAmount: string
      validTo: number
      appData: string
      feeAmount: string
      kind: string
      partiallyFillable: boolean
      sellTokenBalance: string
      buyTokenBalance: string
      signingScheme: string
    }
    from: string
    expiration: string
    id: number
    verified: boolean
  }
}

export type AsyncSwapResponse = {
  universalQuotes: AsyncSwapQuote[]
  cowswapQuotes: AsyncSwapQuote[]
}
