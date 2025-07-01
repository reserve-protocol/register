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

export interface ZapperConfig {
  wagmiConfig: Config
  chainId: number
  dtf: {
    address: Address
    symbol: string
    name: string
    decimals: number
    logoUri?: string
  }
  apiUrl?: string
}

export interface ZapperTheme {
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  borderRadius?: string
}

export interface ZapperProps {
  config: ZapperConfig
  mode?: 'modal' | 'inline'
  theme?: ZapperTheme
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children?: ReactNode
}

export interface UseZapperModalReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export * from './api'
