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
import { useEffect, useState } from 'react'

const DTFCover = ({ cover }: { cover: string | undefined }) => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (cover) {
      setIsLoading(true)
      const img = new Image()
      img.onload = () => setIsLoading(false)
      img.onerror = () => setIsLoading(false)
      img.src = cover
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
        alt="DTF"
        src={cover}
      />
    )
  }

  return <CoverPlaceholder className="text-legend" width={306} height={306} />
}

const DTFLeftCard = ({ dtf }: { dtf: IndexDTFItem }) => {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="border rounded-3xl p-4 flex justify-center items-center bg-card">
        <DTFCover cover={dtf.brand?.cover} />
      </div>
      <Provider>
        <div className="bg-card rounded-3xl">
          <ZapperWrapper
            wagmiConfig={wagmiConfig}
            chain={dtf.chainId as AvailableChain}
            dtfAddress={dtf.address}
            mode="inline"
            apiUrl={RESERVE_API}
          />
        </div>
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
              'None'
            )}
          </span>
        </div>
      </div>
      <h4 className="mb-4 font-semibold">What's in {dtf.symbol}?</h4>
      <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
        {dtf.basket.slice(0, 8).map((token) => (
          <div
            key={token.address}
            className="flex gap-2 items-center text-sm"
          >
            <TokenLogo
              address={token.address}
              chain={dtf.chainId}
              symbol={token.symbol}
            />
            <span className="mr-auto">
              {token.symbol}
            </span>
            <span className="font-medium text-primary">{token.weight}%</span>
          </div>
        ))}
        {dtf.basket.length > 8 && (
          <div className="text-xs text-muted-foreground text-center pt-2">
            +{dtf.basket.length - 8} more
          </div>
        )}
      </div>
    </div>
  )
}

const DTFHomeCardFixed = ({ dtf }: { dtf: IndexDTFItem }) => {
  return (
    <div className="w-full max-w-[1400px] mx-auto p-4">
      <div className="grid grid-cols-[380px_1fr] gap-3">
        <DTFLeftCard dtf={dtf} />
        <DTFBasket dtf={dtf} />
      </div>
    </div>
  )
}

export default DTFHomeCardFixed