import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import {
  V1SurfaceRole,
  v1SemanticRecipes,
} from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import * as React from 'react'

export type EntityLogoSize = 'sm' | 'md' | 'lg' | 'xl'

const badgeGeometry: Record<
  EntityLogoSize,
  { size: number; position: string }
> = {
  sm: { size: 10, position: '-bottom-0.5 -right-0.5' },
  md: { size: 12, position: '-bottom-0.5 -right-1' },
  lg: { size: 14, position: '-bottom-0.5 -right-1' },
  xl: { size: 16, position: '-bottom-1 -right-1' },
}

export interface ChainBadgedLogoProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children'
> {
  symbol?: string
  address?: string
  chain: number
  src?: string
  size?: EntityLogoSize
  surface?: V1SurfaceRole
  alt?: string
}

export const ChainBadgedLogo = React.forwardRef<
  HTMLSpanElement,
  ChainBadgedLogoProps
>(
  (
    {
      symbol,
      address,
      chain,
      src,
      size = 'lg',
      surface = 'content',
      alt = '',
      className,
      ...props
    },
    ref
  ) => {
    const badge = badgeGeometry[size]

    return (
      <span
        ref={ref}
        data-testid="canonical-chain-badged-logo"
        className={cn('relative inline-flex shrink-0', className)}
        {...props}
      >
        <TokenLogo
          symbol={symbol}
          address={address}
          chain={chain}
          src={src}
          size={size}
          alt={alt}
        />
        <ChainLogo
          data-testid="canonical-chain-badge"
          chain={chain}
          width={badge.size}
          height={badge.size}
          className={cn(
            'absolute rounded border',
            badge.position,
            v1SemanticRecipes.surfaceSeparation[surface]
          )}
          aria-hidden="true"
        />
      </span>
    )
  }
)

ChainBadgedLogo.displayName = 'ChainBadgedLogo'
