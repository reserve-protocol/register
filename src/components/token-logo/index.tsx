import { cn } from '@/lib/utils'
import { UNIVERSAL_ASSETS } from '@/utils/constants'
import { indexDTFIconsAtom } from '@/views/portfolio/atoms'
import { useAtom, useAtomValue } from 'jotai'
import * as React from 'react'
import { routeCacheAtom } from './atoms'

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
  const indexDTFIcons = useAtomValue(indexDTFIconsAtom)
  const [routeCache, setRouteCache] = useAtom(routeCacheAtom)
  const {
    symbol,
    size = 'md',
    height,
    address,
    chain,
    width,
    className,
    src: propsSrc,
    ...rest
  } = props

  const h = height || sizeMap[size].height
  const w = width || sizeMap[size].width
  const [currentSrc, setCurrentSrc] = React.useState('')
  const [isWrapped, setIsWrapped] = React.useState(false)

  const tryLoadImage = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = url

      const timeoutId = setTimeout(() => {
        reject(new Error('Image load timeout'))
      }, 5000)

      img.onload = () => {
        clearTimeout(timeoutId)
        resolve(url)
      }

      img.onerror = () => {
        clearTimeout(timeoutId)
        reject() // Remove error message to avoid console logging
      }
    })
  }

  const cacheUrl = (url: string) => {
    if (address && chain) {
      setRouteCache((prev) => ({
        ...prev,
        [`${address.toLowerCase()}-${chain}`]: url,
      }))
    }
  }

  const loadImage = React.useCallback(async () => {
    try {
      // check cache first
      if (address && chain) {
        const cacheKey = `${address.toLowerCase()}-${chain}`
        if (routeCache[cacheKey]) {
          setCurrentSrc(routeCache[cacheKey])
          return
        }
      }

      // If we have a direct src, try to use it first
      if (propsSrc) {
        const url = await tryLoadImage(propsSrc)
        cacheUrl(url)
        setCurrentSrc(url)
        return
      }

      // If we have a symbol, try to load the logo according to convention
      if (symbol) {
        const symbolWithoutVault = symbol.endsWith('-VAULT')
          ? symbol.replace('-VAULT', '')
          : symbol

        const imgSrc = getKnownTokenLogo(symbolWithoutVault)
        if (imgSrc) {
          cacheUrl(imgSrc)
          setCurrentSrc(imgSrc)
          return
        }
      }

      const foundIndexDTFIcon =
        address && chain && indexDTFIcons[chain]?.[address.toLowerCase()]
      if (foundIndexDTFIcon) {
        const imgUrl = await tryLoadImage(foundIndexDTFIcon)
        cacheUrl(imgUrl)
        setCurrentSrc(imgUrl)
        return
      }

      if (address && symbol && UNIVERSAL_ASSETS.has(address.toLowerCase())) {
        try {
          const universalUrl = `https://www.universal.xyz/wrapped-tokens/UA-${symbol.toUpperCase().substring(1)}.svg`
          const url = await tryLoadImage(universalUrl)
          // cacheUrl(url) // don't cache universal logos because of the wrapper... solve later
          setCurrentSrc(url)
          setIsWrapped(true)
          return
        } catch (error) {
          console.debug(`Failed to load dexscreener image for ${address}`)
        }
      }

      // If we have address and chain, try external APIs
      if (address && chain) {
        try {
          const dexscreenerUrl = `https://dd.dexscreener.com/ds-data/tokens/base/${address?.toLowerCase()}.png?size=lg`
          const url = await tryLoadImage(dexscreenerUrl)
          cacheUrl(url)
          setCurrentSrc(url)
          return
        } catch (error) {
          console.debug(`Failed to load dexscreener image for ${address}`)
        }

        try {
          const llamaUrl = `https://token-icons.llamao.fi/icons/tokens/${chain}/${address?.toLowerCase()}?h=${h}&w=${w}`
          const url = await tryLoadImage(llamaUrl)
          cacheUrl(url)
          setCurrentSrc(url)
          return
        } catch (error) {
          console.debug(`Failed to load llama image for ${address}`)
        }
      }

      throw new Error('No valid image source found')
    } catch (error) {
      console.debug('Failed to load token logo:', error)
      setCurrentSrc('/svgs/defaultLogo.svg')
    }
  }, [propsSrc, symbol, address, chain, h, w])

  React.useEffect(() => {
    setCurrentSrc('')
    loadImage()
  }, [loadImage])

  return (
    <img
      ref={ref}
      src={currentSrc || '/svgs/defaultLogo.svg'}
      height={h}
      width={w}
      style={{ width: w, height: h }}
      className={cn(
        'flex-shrink-0 object-contain object-center',
        className,
        TRANSPARENT_TOKENS.has(symbol?.toLowerCase() || '') && 'bg-black',
        isWrapped ? 'bg-transparent' : 'rounded-full'
      )}
      onError={() => setCurrentSrc('/svgs/defaultLogo.svg')}
      {...rest}
    />
  )
})

TokenLogo.displayName = 'TokenLogo'

export default TokenLogo

export const TRANSPARENT_TOKENS = new Set(['altt', 'emp'])

export const SVGS = new Set([
  'dai',
  'cdai',
  'rsr',
  'strsr',
  'rsv',
  'tusd',
  'usdt',
  'cusdt',
  'usdc',
  'cusdc',
  'usdbc',
  'usdp',
  'wsgusdbc',
  'wcusdcv3',
  'wcusdtv3',
  'wcusdbcv3',
  'wbtc',
  'cwbtc',
  'ceth',
  'eth',
  'busd',
  'weth',
  'sadai',
  'sausdc',
  'sabasusdbc',
  'sausdt',
  'eurt',
  'fusdc',
  'fusdt',
  'fdai',
  'wcUSDCv3',
  'wsteth',
  'cbeth',
  'meusd',
  'reth',
  'stkcvx3crv',
  'stkcvxcrv3crypto',
  'stkcvxeusd3crv-f',
  'stkcvxeth+eth-f',
  'stkcvxmim-3lp3crv-f',
  'sdai',
  'mrp-ausdt',
  'mrp-ausdc',
  'mrp-adai',
  'mrp-awbtc',
  'mrp-aweth',
  'mrp-awteth',
  'mrp-asteth',
  'frax',
  'crvusd',
  'mkusd',
  'eusd',
  're7weth',
  'saethusdc',
  'saethpyusd',
  'pyusd',
  'sabasusdc',
  'saarbusdcn',
  'sfrxeth',
  'usd+',
  'pxeth',
  'apxeth',
  'susde',
  'sdt',
  'wusdm',
  'eth+',
  'wsamm-eusd/usdc',
])

export const PNGS = new Set([
  'steakusdc',
  'mai',
  'dola',
  'fxusd',
  'alusd',
  'ethx',
  'dtf',
  'trx',
  'wbnb',
  'toncoin',
  'bgb',
  'sttao',
  'bonk',
])

function getKnownTokenLogo(symbol: string) {
  if (SVGS.has(symbol.toLowerCase())) {
    return `/svgs/${symbol.toLowerCase()}.svg`
  }
  if (PNGS.has(symbol.toLowerCase())) {
    return `/imgs/${symbol.toLowerCase()}.png`
  }
  return ''
}
