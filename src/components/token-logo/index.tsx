import * as React from 'react'
import { RESERVE_STORAGE } from '@/utils/constants'
import { cn } from '@/lib/utils'

type Sizes = 'sm' | 'md' | 'lg' | 'xl'

const sizeMap: Record<Sizes, { width: number; height: number }> = {
  sm: { width: 16, height: 16 },
  md: { width: 20, height: 20 },
  lg: { width: 24, height: 24 },
  xl: { width: 32, height: 32 },
}

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  symbol?: string
  size?: Sizes
  address?: string
  chain?: number
}

const TokenLogo = React.forwardRef<HTMLImageElement, Props>((props, ref) => {
  const {
    symbol,
    size = 'md',
    height,
    address,
    chain,
    width,
    className,
    src,
    ...rest
  } = props
  const h = height || sizeMap[size].height
  const w = width || sizeMap[size].width
  const [srcState, setSrcState] = React.useState('')

  const preloadImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const highResImage = new Image()
      highResImage.src = url
      highResImage.onload = () => {
        resolve(url)
      }
      highResImage.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`))
      }
    })
  }

  React.useEffect(() => {
    if (!src && (symbol || (address && chain))) {
      const dexscreenerUrl = `https://dd.dexscreener.com/ds-data/tokens/base/${address}.png?size=lg`
      const llamaUrl = `https://token-icons.llamao.fi/icons/tokens/${chain}/${address}?h=${h}&w=${w}`
      const symbolUrl = symbol ? RESERVE_STORAGE + symbol + '.png' : null

      if (symbolUrl) {
        preloadImage(symbolUrl)
          .then(setSrcState)
          .catch(() => {
            // Fallback silently
          })
      } else {
        preloadImage(dexscreenerUrl)
          .then(setSrcState)
          .catch(() => {
            preloadImage(llamaUrl)
              .then(setSrcState)
              .catch(() => {
                // Fallback silently
              })
          })
      }
    }
  }, [symbol, address, chain, h, w, src])

  return (
    <img
      src={src || srcState || '/svgs/defaultLogo.svg'}
      ref={ref}
      height={h}
      width={w}
      style={{ height: h, width: w }}
      className={cn('flex-shrink-0 rounded-full', className)}
      {...rest}
    />
  )
})

export default TokenLogo
