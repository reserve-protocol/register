export type NativeToken = {
  symbol: string
  name: string
  address?: string
  logo: string
  caip2: string
  url?: string
  coingeckoId?: string
  marketCap?: number
  price?: number
  priceChange7d?: number
}

export type Bridge = {
  id: string
  name: string
  url: string
  description: string
  logo: string
  risks: string[]
  wrappedVersion: boolean
}
