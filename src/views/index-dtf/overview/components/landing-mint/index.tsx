import CoverPlaceholder from '@/components/icons/cover-placeholder'
import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeftRight } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import ZapMint from '../zap-mint'
import { currentZapMintTabAtom } from '../zap-mint/atom'

const MintBox = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const brand = useAtomValue(indexDTFBrandAtom)
  const setZapMintTab = useSetAtom(currentZapMintTabAtom)

  return (
    <div className="rounded-3xl bg-card p-2">
      <div className="flex flex-col justify-between gap-8 p-4">
        <div className="flex items-center gap-2">
          <StackTokenLogo
            tokens={[
              { symbol: 'USDT', address: '0x0' },
              { symbol: 'USDC', address: '0x1' },
              { symbol: 'ETH', address: '0x2' },
            ]}
            size={24}
          />
          <ArrowLeftRight className="w-4 h-4" />
          <TokenLogo src={brand?.dtf?.icon || undefined} size="lg" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-xl font-bold text-primary">
            Buy/Sell {dtf?.token.symbol} onchain
          </div>
          <div className="text-sm">
            Our Zap-swaps support common assets like ETH, USDC, USDT, and
            others, which makes DTFs easy to enter and exit.
          </div>
        </div>
      </div>
      <ZapMint>
        <div
          className="flex flex-col gap-2"
          onClick={(e) => {
            if (!(e.target instanceof HTMLButtonElement)) {
              e.preventDefault()
            }
          }}
        >
          <Button
            className="rounded-xl h-12"
            onClick={() => setZapMintTab('buy')}
          >
            Buy
          </Button>
          <Button
            className="rounded-xl h-12"
            variant="outline"
            onClick={() => setZapMintTab('sell')}
          >
            Sell
          </Button>
        </div>
      </ZapMint>
    </div>
  )
}

const CoverImage = () => {
  const brand = useAtomValue(indexDTFBrandAtom)
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
    if (brand) {
      const loadImage = async () => {
        setIsLoading(true)
        try {
          if (brand?.dtf?.cover) {
            await tryLoadImage(brand.dtf.cover)
          }
        } catch (error) {}
        setIsLoading(false)
      }

      loadImage()
    }
  }, [brand])

  if (isLoading) {
    return <Skeleton className="w-[450px] h-[450px] rounded-3xl" />
  }

  if (brand?.dtf?.cover) {
    return (
      <img
        width={450}
        height={450}
        className="object-cover h-[450px] w-[450px] rounded-3xl"
        alt="DTF meme"
        src={brand.dtf.cover}
      />
    )
  }

  return <CoverPlaceholder className="text-legend" />
}

const LandingMint = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="hidden xl:flex xl:flex-col xl:gap-1 relative" {...props}>
      <CoverImage />
      <div className="w-[450px] sticky top-0 rounded-4xl bg-muted p-1">
        <MintBox />
      </div>
    </div>
  )
}

export default LandingMint
