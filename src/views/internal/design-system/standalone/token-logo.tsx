import { forwardRef, useState, type ImgHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type TokenLogoSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZE: Record<TokenLogoSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
}

interface StandaloneTokenLogoProps extends ImgHTMLAttributes<HTMLImageElement> {
  address?: string
  chain?: number
  size?: TokenLogoSize
  symbol?: string
}

const localSymbolSource = (symbol?: string) =>
  symbol ? `/svgs/${symbol.toLowerCase().replace('-vault', '')}.svg` : ''

const localImageSource = (src?: string, symbol?: string) => {
  if (src?.startsWith('/') || src?.startsWith('data:')) return src
  return localSymbolSource(symbol)
}

const StandaloneTokenLogo = forwardRef<
  HTMLImageElement,
  StandaloneTokenLogoProps
>(
  (
    {
      address: _address,
      chain: _chain,
      className,
      height,
      size = 'md',
      src,
      symbol,
      width,
      ...imageProps
    },
    ref
  ) => {
    const [source, setSource] = useState(
      localImageSource(typeof src === 'string' ? src : undefined, symbol)
    )
    const dimension = SIZE[size]

    return (
      <img
        {...imageProps}
        ref={ref}
        className={cn('shrink-0 rounded-full object-cover', className)}
        data-documentation-token-logo
        height={height ?? dimension}
        onError={(event) => {
          imageProps.onError?.(event)
          if (!source.endsWith('/svgs/defaultLogo.svg')) {
            setSource('/svgs/defaultLogo.svg')
          }
        }}
        src={source || '/svgs/defaultLogo.svg'}
        width={width ?? dimension}
      />
    )
  }
)

StandaloneTokenLogo.displayName = 'StandaloneTokenLogo'

export default StandaloneTokenLogo
