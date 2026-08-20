import ChainLogo from '@/components/icons/ChainLogo'
import { type V1SurfaceRole } from '@/components/ui/v1-semantic-recipes'
import * as React from 'react'

import { LogoStackFrames, SEPARATOR_WIDTH } from './logo-stack-frames'

const CHAIN_ARTWORK_RADIUS_RATIO = 4.5 / 20

export interface ChainLogoStackProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'children'
> {
  chains: readonly number[]
  size?: number
  overlap?: number
  surface?: V1SurfaceRole
}

export const ChainLogoStack = React.forwardRef<
  HTMLSpanElement,
  ChainLogoStackProps
>(({ chains, size = 16, overlap = 4, surface = 'content', ...props }, ref) => (
  <LogoStackFrames
    ref={ref}
    data-testid="canonical-chain-logo-stack"
    artworkSize={size}
    frameRadius={size * CHAIN_ARTWORK_RADIUS_RATIO + SEPARATOR_WIDTH}
    overlap={overlap}
    surface={surface}
    {...props}
  >
    {chains.map((chain) => (
      <ChainLogo
        key={chain}
        chain={chain}
        width={size}
        height={size}
        aria-hidden="true"
      />
    ))}
  </LogoStackFrames>
))

ChainLogoStack.displayName = 'ChainLogoStack'
