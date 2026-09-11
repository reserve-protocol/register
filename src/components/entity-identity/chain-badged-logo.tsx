import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import {
  V1SurfaceRole,
  v1SemanticRoles,
} from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'
import * as React from 'react'

export type EntityLogoSize = 'sm' | 'md' | 'lg' | 'xl'

const badgeSizes: Record<EntityLogoSize, number> = {
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
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
    const badgeSize = badgeSizes[size]

    return (
      <span
        ref={ref}
        data-testid="canonical-chain-badged-logo"
        data-entity-logo-size={size}
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
          width={badgeSize}
          height={badgeSize}
          className={cn(
            'absolute rounded',
            size === 'xl'
              ? '-bottom-0.5 -right-[3px] border-2'
              : '-bottom-[1.5px] -right-[2.5px] border-[1.5px]',
            v1SemanticRoles.surfaceSeparation[surface]
          )}
          aria-hidden="true"
        />
      </span>
    )
  }
)

ChainBadgedLogo.displayName = 'ChainBadgedLogo'
