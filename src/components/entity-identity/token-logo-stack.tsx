import TokenLogo from '@/components/token-logo'
import { V1SurfaceRole } from '@/components/design-system-v1/semantic-roles'
import * as React from 'react'

import { LogoStackFrames } from './logo-stack-frames'

export interface TokenLogoStackItem {
  symbol: string
  logo?: string
  address?: string
  chain?: number
  name?: string
}

export interface TokenLogoStackProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children'
> {
  tokens: TokenLogoStackItem[]
  size?: number
  overlap?: number
  surface?: V1SurfaceRole
}

export const TokenLogoStack = React.forwardRef<
  HTMLSpanElement,
  TokenLogoStackProps
>(
  (
    {
      tokens,
      size = 24,
      overlap = 2,
      surface = 'content',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <LogoStackFrames
        ref={ref}
        data-testid="canonical-token-logo-stack"
        artworkSize={size}
        className={className}
        frameRadius="9999px"
        overlap={overlap}
        surface={surface}
        {...props}
      >
        {tokens.map((token, index) => (
          <TokenLogo
            key={`${token.chain ?? 'token'}-${token.address ?? token.symbol}-${index}`}
            src={token.logo}
            symbol={token.symbol}
            address={token.address}
            chain={token.chain}
            width={size}
            height={size}
            alt={token.name ?? token.symbol}
          />
        ))}
      </LogoStackFrames>
    )
  }
)

TokenLogoStack.displayName = 'TokenLogoStack'
