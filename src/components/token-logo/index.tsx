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
}

const TokenLogo = React.forwardRef<HTMLImageElement, Props>((props, ref) => {
  const { symbol, size = 'md', height, width, className, src, ...rest } = props
  const [srcState, setSrcState] = React.useState('')

  const preloadImage = (symbol: string): Promise<string> => {
    return new Promise((resolve) => {
      const url = RESERVE_STORAGE + symbol + '.png'
      const highResImage = new Image()
      highResImage.src = url
      highResImage.onload = () => {
        resolve(url)
      }
    })
  }

  React.useEffect(() => {
    if (symbol && !src) {
      preloadImage(symbol).then(setSrcState)
    }
  }, [symbol])

  return (
    <img
      src={src || srcState || '/svgs/defaultLogo.svg'}
      ref={ref}
      height={height || sizeMap[size].height}
      width={width || sizeMap[size].width}
      {...rest}
    />
  )
})

export default TokenLogo
