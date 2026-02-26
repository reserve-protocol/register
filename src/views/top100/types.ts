import { Address } from 'viem'

export type Top100DTF = {
  address: Address
  name: string
  symbol: string
  chainId: number
  totalSupply: string
  currentHolderCount: number
  timestamp: number
  // Enriched from price API (nullable until loaded)
  price: number | null
  marketCap: number | null
  basket: { address: Address; symbol: string; weight?: string }[]
  // Enriched from brand API (optional)
  brand?: { icon?: string; cover?: string; tags?: string[] }
}
