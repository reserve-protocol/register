import CoverPlaceholder from '@/components/icons/cover-placeholder'
import TokenLogo from '@/components/token-logo'
import { Skeleton } from '@/components/ui/skeleton'
import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { wagmiConfig } from '@/state/chain'
import { AvailableChain } from '@/utils/chains'
import { RESERVE_API } from '@/utils/constants'
import ZapperWrapper from '@/views/index-dtf/components/zapper/zapper-wrapper'
import { Provider } from 'jotai'
import { Gem, Tags, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { motion } from 'motion/react'

const DTFCover = ({ cover }: { cover: string | undefined }) => {
  const [isLoading, setIsLoading] = useState(true)

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
        reject()
      }
    })
  }

  useEffect(() => {
    if (cover) {
      const loadImage = async () => {
        setIsLoading(true)
        try {
          if (cover) {
            await tryLoadImage(cover)
          }
        } catch (error) {}
        setIsLoading(false)
      }

      loadImage()
    } else {
      setIsLoading(false)
    }
  }, [cover])

  if (isLoading) {
    return <Skeleton className="w-[306px] h-[306px] rounded-3xl" />
  }

  if (cover) {
    return (
      <img
        width={306}
        height={306}
        className="object-cover h-[306px] w-[306px] rounded-3xl"
        alt="DTF meme"
        src={cover}
      />
    )
  }

  return <CoverPlaceholder className="text-legend" width={306} height={306} />
}

// Price Performance Chart Component
const PricePerformanceChart = ({ dtf }: { dtf: IndexDTFItem }) => {
  // Mock data for price performance - in production this would come from API
  const mockPerformance = useMemo(() => {
    const seed = dtf.symbol.charCodeAt(0)
    const change24h = ((seed * 3.7) % 20) - 10 // -10% to +10%
    const change7d = ((seed * 5.3) % 30) - 15 // -15% to +15%
    const change30d = ((seed * 7.1) % 40) - 20 // -20% to +20%

    return {
      price: dtf.price || 1.0,
      change24h,
      change7d,
      change30d,
      tvl: dtf.totalSupply ? Number(dtf.totalSupply) / 1e18 : 0,
      volume24h: Math.random() * 1000000 // Mock volume
    }
  }, [dtf])

  const formatCurrency = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }

  const formatPercent = (value: number) => {
    const formatted = value.toFixed(2)
    return value >= 0 ? `+${formatted}%` : `${formatted}%`
  }

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-500'
    if (value < 0) return 'text-red-500'
    return 'text-gray-500'
  }

  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp size={16} />
    if (value < 0) return <TrendingDown size={16} />
    return <Minus size={16} />
  }

  return (
    <div className="bg-card rounded-3xl p-6 h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">{dtf.symbol} Performance</h3>
          <div className="text-2xl font-bold">{formatCurrency(mockPerformance.price)}</div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">24h</div>
            <div className={`flex items-center justify-center gap-1 ${getChangeColor(mockPerformance.change24h)}`}>
              {getChangeIcon(mockPerformance.change24h)}
              <span className="font-medium">{formatPercent(mockPerformance.change24h)}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">7d</div>
            <div className={`flex items-center justify-center gap-1 ${getChangeColor(mockPerformance.change7d)}`}>
              {getChangeIcon(mockPerformance.change7d)}
              <span className="font-medium">{formatPercent(mockPerformance.change7d)}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">30d</div>
            <div className={`flex items-center justify-center gap-1 ${getChangeColor(mockPerformance.change30d)}`}>
              {getChangeIcon(mockPerformance.change30d)}
              <span className="font-medium">{formatPercent(mockPerformance.change30d)}</span>
            </div>
          </div>
        </div>

        {/* Mock Chart Area */}
        <div className="flex-grow bg-muted/30 rounded-xl p-4 mb-4">
          <svg viewBox="0 0 300 100" className="w-full h-full">
            <defs>
              <linearGradient id={`gradient-${dtf.symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`M 0,80 C 50,70 100,${mockPerformance.change24h > 0 ? '30' : '90'} 150,50 S 250,${mockPerformance.change7d > 0 ? '20' : '60'} 300,40`}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className={mockPerformance.change24h > 0 ? 'text-green-500' : 'text-red-500'}
            />
            <path
              d={`M 0,80 C 50,70 100,${mockPerformance.change24h > 0 ? '30' : '90'} 150,50 S 250,${mockPerformance.change7d > 0 ? '20' : '60'} 300,40 L 300,100 L 0,100 Z`}
              fill={`url(#gradient-${dtf.symbol})`}
              className={mockPerformance.change24h > 0 ? 'text-green-500' : 'text-red-500'}
            />
          </svg>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <div className="text-xs text-muted-foreground">TVL</div>
            <div className="font-medium">{formatCurrency(mockPerformance.tvl)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">24h Volume</div>
            <div className="font-medium">{formatCurrency(mockPerformance.volume24h)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const DTFLeftCard = ({ dtf }: { dtf: IndexDTFItem }) => {
  return (
    <div className="flex flex-col gap-2 bg-card rounded-4xl p-2 h-full">
      <div className="border rounded-3xl p-4 flex justify-center items-center bg-background">
        <DTFCover cover={dtf.brand?.cover} />
      </div>
      <Provider>
        <ZapperWrapper
          wagmiConfig={wagmiConfig}
          chain={dtf.chainId as AvailableChain}
          dtfAddress={dtf.address}
          mode="inline"
          apiUrl={RESERVE_API}
        />
      </Provider>
    </div>
  )
}

const DTFBasket = ({ dtf }: { dtf: IndexDTFItem }) => {
  return (
    <div className="bg-card rounded-3xl p-6 h-full">
      <div className="flex items-center mb-6">
        <Gem size={24} strokeWidth={1} />
        <div className="flex items-center text-legend ml-auto text-xs gap-1">
          <Tags size={16} />
          <span>
            {dtf.brand?.tags?.length ? (
              dtf.brand.tags.join(', ')
            ) : (
              <span className="text-legend">None</span>
            )}
          </span>
        </div>
      </div>
      <h4 className="mb-4 font-semibold">What's in the {dtf.symbol} Index?</h4>
      <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
        {dtf.basket.slice(0, 10).map((token, index) => (
          <motion.div
            key={token.address}
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2 items-center text-sm"
          >
            <TokenLogo
              address={token.address}
              chain={dtf.chainId}
              symbol={token.symbol}
            />
            <span className="mr-auto text-foreground">
              {token.name} ({token.symbol})
            </span>
            <span className="font-medium text-primary">{token.weight}%</span>
          </motion.div>
        ))}
        {dtf.basket.length > 10 && (
          <div className="text-xs text-muted-foreground text-center pt-2">
            +{dtf.basket.length - 10} more tokens
          </div>
        )}
      </div>
    </div>
  )
}

const DTFRightCard = ({ dtf }: { dtf: IndexDTFItem }) => {
  return (
    <div className="grid grid-cols-2 gap-2 h-full">
      <PricePerformanceChart dtf={dtf} />
      <DTFBasket dtf={dtf} />
    </div>
  )
}

const DTFHomeCardEnhanced = ({ dtf }: { dtf: IndexDTFItem }) => {
  return (
    <div className="w-full max-w-[1400px] mx-auto">
      <div className="grid grid-cols-[380px_1fr] gap-2 bg-background/95 backdrop-blur rounded-4xl p-2">
        <DTFLeftCard dtf={dtf} />
        <DTFRightCard dtf={dtf} />
      </div>
    </div>
  )
}

export default DTFHomeCardEnhanced