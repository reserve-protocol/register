import CoverPlaceholder from '@/components/icons/cover-placeholder'
import TokenLogo from '@/components/token-logo'
import { Skeleton } from '@/components/ui/skeleton'
import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { wagmiConfig } from '@/state/chain'
import { RESERVE_API } from '@/utils/constants'
import ZapperWrapper from '@/views/index-dtf/components/zapper/zapper-wrapper'
import { Provider } from 'jotai'
import { Gem, Tags } from 'lucide-react'
import { useEffect, useState } from 'react'

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
        reject() // Remove error message to avoid console logging
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
    }
  }, [cover])

  if (isLoading) {
    return <Skeleton className="w-[450px] h-[450px] rounded-4xl" />
  }

  if (cover) {
    return (
      <img
        width={450}
        height={450}
        className="object-cover h-[306px] w-[306px] rounded-4xl"
        alt="DTF meme"
        src={cover}
      />
    )
  }

  return <CoverPlaceholder className="text-legend" width={306} height={306} />
}
const DTFLeftCard = ({ dtf }: { dtf: IndexDTFItem }) => {
  return (
    <div className="flex flex-col gap-2 bg-card rounded-4xl p-2">
      <div className="border rounded-3xl p-4 flex justify-center items-center">
        <DTFCover cover={dtf.brand?.cover} />
      </div>
      <Provider>
        <ZapperWrapper
          wagmiConfig={wagmiConfig}
          chain={dtf.chainId}
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
    <div className="bg-card/80 rounded-r-4xl p-6">
      <div className="flex items-center mb-8">
        <Gem size={24} strokeWidth={1} />
        <div className="flex items-center text-legend ml-auto text-xs gap-1">
          <Tags size={16} />
          <span>
            {dtf.brand?.tags?.length ? (
              dtf.brand.tags.join(', ')
            ) : (
              <div className="text-legend">None</div>
            )}
          </span>
        </div>
      </div>
      <h4 className="mb-4">What's in the {dtf.symbol} Index?</h4>
      <div className="flex flex-col gap-4">
        {dtf.basket.map((token) => (
          <div key={token.address} className="flex gap-2 items-center text-sm">
            <TokenLogo
              address={token.address}
              chain={dtf.chainId}
              symbol={token.symbol}
            />
            <span className="mr-auto">
              {token.name} ({token.symbol})
            </span>
            <span>{token.weight}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const DTFRightCard = ({ dtf }: { dtf: IndexDTFItem }) => {
  return (
    <div className="grid grid-cols-2 gap-[1px] ">
      <div className="rounded-l-4xl p-4"></div>
      <DTFBasket dtf={dtf} />
    </div>
  )
}

const DTFHomeCard = ({ dtf }: { dtf: IndexDTFItem }) => {
  return (
    <div className="container grid grid-cols-[380px_1fr] gap-[1px]">
      <DTFLeftCard dtf={dtf} />
      <DTFRightCard dtf={dtf} />
    </div>
  )
}

export default DTFHomeCard
