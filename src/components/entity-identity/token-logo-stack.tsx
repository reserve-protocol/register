import TokenLogo from '@/components/token-logo'
import {
  V1SurfaceRole,
  v1SemanticRecipes,
} from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import * as React from 'react'

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
    const overlapAmount = Math.round(size / 2) + overlap

    return (
      <span
        ref={ref}
        data-testid="canonical-token-logo-stack"
        className={cn('inline-flex min-w-max items-center', className)}
        {...props}
      >
        {tokens.map((token, index) => (
          <span
            key={`${token.chain ?? 'token'}-${token.address ?? token.symbol}-${index}`}
            className={cn(
              'relative inline-flex shrink-0 rounded-full border-2',
              v1SemanticRecipes.surfaceSeparation[surface]
            )}
            style={{
              marginLeft: index === 0 ? 0 : -overlapAmount,
              zIndex: tokens.length - index,
            }}
          >
            <TokenLogo
              src={token.logo}
              symbol={token.symbol}
              address={token.address}
              chain={token.chain}
              width={size}
              height={size}
              alt={token.name ?? token.symbol}
            />
          </span>
        ))}
      </span>
    )
  }
)

TokenLogoStack.displayName = 'TokenLogoStack'
