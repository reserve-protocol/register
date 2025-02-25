import { Address } from 'viem'

export interface AssetPrice {
  address: Address
  price: number
  timestamp: number
}

export interface DTFBasketToken {
  address: Address
  amount: number
  amountRaw: string
  decimals: number
  price: number
  weight: string
}

export interface DTFPrice {
  address: Address
  price: number
  basket: DTFBasketToken[]
}
