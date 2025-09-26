import ChainLogo from '@/components/icons/ChainLogo'
import CoverPlaceholder from '@/components/icons/cover-placeholder'
import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { formatCurrency, getFolioRoute } from '@/utils'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const IndexDTFCard = ({ dtf }: { dtf: IndexDTFItem }) => {
  const LIMIT = 10
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const head = dtf.basket.slice(0, LIMIT)

  return (
    <Link
      className="bg-background flex rounded-3xl gap-3 p-3"
      to={getFolioRoute(dtf.address, dtf.chainId)}
    >
      <div className="relative h-[100px] w-[100px] rounded-xl overflow-hidden flex-shrink-0">
        {/* Show skeleton while loading */}
        {dtf?.brand?.cover && !imageError && (
          <>
            {!imageLoaded && (
              <Skeleton className="absolute inset-0 h-full w-full" />
            )}
            <img
              width={100}
              height={100}
              className={cn(
                "object-cover h-[100px] w-[100px] rounded-xl transition-opacity duration-500",
                imageLoaded ? "opacity-100 animate-fade-in" : "opacity-0"
              )}
              alt="DTF cover"
              src={dtf.brand.cover}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true)
                setImageLoaded(false)
              }}
            />
          </>
        )}
        {/* Show placeholder if no image or error */}
        {(!dtf?.brand?.cover || imageError) && (
          <CoverPlaceholder className="text-legend" width={100} height={100} />
        )}
      </div>
      <div className="border-l pl-3 flex flex-grow flex-col gap-2">
        <div className="flex items-center">
          <div className="relative">
            <TokenLogo src={dtf?.brand?.icon || undefined} size="md" />
            <ChainLogo
              fontSize={10}
              chain={dtf.chainId}
              className="absolute -bottom-0.5 -right-0.5"
            />
          </div>
          <Button
            variant="muted"
            className="ml-auto h-5 w-5 p-1"
            size="icon-rounded"
          >
            <ArrowRight size={16} />
          </Button>
        </div>
        <h4 className="font-semibold text-sm mt-auto pt-2">{dtf.name}</h4>
        <div className="flex items-end text-xs ">
          <StackTokenLogo
            tokens={head.map((r) => ({ ...r, chain: dtf.chainId }))}
            overlap={2}
            size={20}
            reverseStack
            outsource
          />
          <span className="text-legend ml-auto mr-1">TVL:</span>
          <span>
            $
            {formatCurrency(dtf.marketCap, 0, {
              notation: 'compact',
              compactDisplay: 'short',
            })}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default IndexDTFCard
