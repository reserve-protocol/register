import { ReactNode } from 'react'
import { Config } from 'wagmi'
import { Address } from 'viem'

export interface Token {
  address: Address
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  chainId: number
}

export interface TokenBalance {
  token: Token
  balance: string
  balanceUSD?: string
}

export interface ZapperProps {
  mode?: 'modal' | 'inline'
  chain: number
  dtfAddress: Address
  apiUrl?: string
}

export interface UseZapperModalReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export * from './api'
