import { cn } from '@/lib/utils'
import React from 'react'
import LegacyTokenLogo from '../icons/TokenLogo'
import TokenLogo from '.'

interface Token {
  symbol: string
  logo?: string
  address: string
  chain?: number
}

interface StackTokenLogoProps {
  tokens: Token[]
  size?: number
  reverseStack?: boolean
  overlap?: number
  outsource?: boolean
  className?: string
}

const StackTokenLogo = React.memo(
  ({
    tokens,
    size = 24,
    reverseStack = false,
    overlap = 0,
    outsource = false,
    className,
  }: StackTokenLogoProps) => {
    const gap = -(size / 2) - overlap
    const orderedTokens = reverseStack ? [...tokens].reverse() : tokens

    return (
      <div className={cn('relative flex items-center', className)}>
        {orderedTokens.map((token, index) => {
          const margin = index === 0 ? 0 : gap

          // Special case: FRAXBP renders as FRAX + USDC pair
          if (token.symbol === 'FRAXBP') {
            return (
              <div
                key={token.address}
                className="flex items-center"
                style={{ marginLeft: margin }}
              >
                <LegacyTokenLogo width={size} symbol="frax" />
                <LegacyTokenLogo
                  width={size}
                  symbol="usdc"
                  style={{ marginLeft: gap }}
                />
              </div>
            )
          }

          // Regular token
          const Logo = outsource ? TokenLogo : LegacyTokenLogo
          const logoProps = outsource
            ? {
                width: size,
                height: size,
                symbol: token.symbol,
                chain: token.chain,
                address: token.address,
              }
            : { width: size, symbol: token.symbol, src: token.logo }

          return (
            <div key={token.address} style={{ marginLeft: margin }}>
              <Logo {...logoProps} />
            </div>
          )
        })}
      </div>
    )
  }
)

StackTokenLogo.displayName = 'StackTokenLogo'

export default StackTokenLogo
