import * as React from 'react'
import { RESERVE_STORAGE } from '@/utils/constants'

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
    return new Promise((resolve) => {
      const highResImage = new Image()
      highResImage.src = url
      highResImage.onload = () => {
        resolve(url)
      }
    })
  }

  React.useEffect(() => {
    if (!src && (symbol || (address && chain))) {
      const href = symbol
        ? RESERVE_STORAGE + symbol + '.png'
        : `https://token-icons.llamao.fi/icons/tokens/${chain}/${address}?h=${h}&w=${w}`

      preloadImage(href).then(setSrcState)
    }
  }, [symbol, address, chain])

  return (
    <img
      src={src || srcState || '/svgs/defaultLogo.svg'}
      ref={ref}
      height={h}
      width={w}
      style={{ height: h, width: w }}
      {...rest}
    />
  )
})

export default TokenLogo
