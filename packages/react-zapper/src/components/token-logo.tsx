import React from 'react'
import { Address } from 'viem'
import { cn } from '../utils/cn'

interface TokenLogoProps {
  src?: string
  symbol?: string
  address?: Address | string
  chain?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12'
}

/**
 * TokenLogo component that displays a token's logo
 * Falls back to a colored circle with the token symbol if no image is available
 */
export function TokenLogo({
  src,
  symbol = '?',
  address,
  chain,
  size = 'md',
  className
}: TokenLogoProps) {
  const sizeClass = sizeClasses[size]
  
  // Generate a deterministic color based on the address or symbol
  const generateColor = (text: string): string => {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 70%, 50%)`
  }

  const color = generateColor(address || symbol)
  const initials = symbol.slice(0, 2).toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt={`${symbol} logo`}
        className={cn(
          sizeClass,
          'rounded-full object-cover border border-border/20',
          className
        )}
        onError={(e) => {
          // Fallback to colored circle if image fails to load
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          if (target.nextElementSibling) {
            (target.nextElementSibling as HTMLElement).style.display = 'flex'
          }
        }}
      />
    )
  }

  return (
    <div
      className={cn(
        sizeClass,
        'rounded-full flex items-center justify-center text-white font-semibold border border-border/20',
        className
      )}
      style={{ backgroundColor: color }}
    >
      <span
        className={cn(
          'text-xs font-bold',
          size === 'xs' && 'text-[8px]',
          size === 'sm' && 'text-[10px]',
          size === 'md' && 'text-xs',
          size === 'lg' && 'text-sm',
          size === 'xl' && 'text-base'
        )}
      >
        {initials}
      </span>
    </div>
  )
}

export default TokenLogo