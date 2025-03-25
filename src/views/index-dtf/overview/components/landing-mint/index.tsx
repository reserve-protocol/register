import CoverPlaceholder from '@/components/icons/cover-placeholder'
import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeftRight, ArrowUpRight, BadgePercent, Coins } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import ZapMint from '../zap-mint'
import { currentZapMintTabAtom } from '../zap-mint/atom'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { Link } from 'react-router-dom'
import Uniswap from '@/components/icons/logos/Uniswap'
import { useDTFCampaign } from '../../hooks/use-campaign'
import { tryLoadImage } from '@/lib/image'
import { resolveIpfsGateway } from '@/lib/ipfs-load'

export const UniswapButton = React.forwardRef<HTMLAnchorElement>(
  (props, ref) => {
    return (
      <Button asChild className="rounded-xl h-12 w-full">
        <Link
          ref={ref}
          to="https://app.uniswap.org/swap?chain=base&inputCurrency=0x4200000000000000000000000000000000000006&outputCurrency=0xebcda5b80f62dd4dd2a96357b42bb6facbf30267"
          target="_blank"
        >
          <div className="flex items-center gap-2">
            <Uniswap />
            Swap on Uniswap
          </div>
        </Link>
      </Button>
    )
  }
)
UniswapButton.displayName = 'UniswapButton'

const CampaignBadge = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const campaignData = useDTFCampaign(indexDTF?.id ?? '')

  if (!campaignData) return null

  return (
    <a
      className="flex items-center gap-2 text-black font-semibold rounded-full text-sm bg-[#FFBE45] px-2 py-1"
      target="_blank"
      href={campaignData.url}
    >
      <Coins size={16} />
      <span>{campaignData.apr.toFixed(2)}% APR</span>
      <ArrowUpRight size={16} />
    </a>
  )
}

const MintBox = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const brand = useAtomValue(indexDTFBrandAtom)
  const setZapMintTab = useSetAtom(currentZapMintTabAtom)
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')

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
          <TokenLogo
            className="mr-auto"
            address={dtf?.id}
            chain={dtf?.chainId}
            src={brand?.dtf?.icon || undefined}
            size="lg"
          />
          <CampaignBadge />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-xl font-semibold ">
            Buy/Sell {dtf?.token.symbol} onchain
          </div>
          <div className="text-legend text-sm">
            Our Zap-swaps support common assets like ETH, USDC, USDT, and
            others, which makes DTFs easy to enter and exit.
          </div>
        </div>
      </div>
      <ZapMint>
        {dtf?.id?.toLowerCase() ===
        '0xebcda5b80f62dd4dd2a96357b42bb6facbf30267' ? (
          <UniswapButton />
        ) : (
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
              onClick={() => {
                trackClick('buy')
                setZapMintTab('buy')
              }}
            >
              Buy
            </Button>
            <Button
              className="rounded-xl h-12"
              variant="outline"
              onClick={() => {
                trackClick('sell')
                setZapMintTab('sell')
              }}
            >
              Sell
            </Button>
          </div>
        )}
      </ZapMint>
    </div>
  )
}

const CoverImage = () => {
  const brand = useAtomValue(indexDTFBrandAtom)
  const [isLoading, setIsLoading] = useState(true)
  const [src, setSrc] = useState(brand?.dtf?.cover)

  useEffect(() => {
    if (brand) {
      const loadImage = async () => {
        setIsLoading(true)
        try {
          if (brand?.dtf?.cover) {
            const url = await tryLoadImage(resolveIpfsGateway(brand.dtf.cover))
            setSrc(url)
          }
        } catch (error) {}
        setIsLoading(false)
      }

      loadImage()
    }
  }, [brand])

  if (isLoading) {
    return <Skeleton className="w-[450px] h-[450px] rounded-4xl" />
  }

  if (src) {
    return (
      <img
        width={450}
        height={450}
        className="object-cover h-[450px] w-[450px] rounded-4xl"
        alt="DTF meme"
        src={src}
      />
    )
  }

  return <CoverPlaceholder className="text-legend" />
}

const LandingMint = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="hidden xl:flex xl:flex-col xl:gap-2 relative" {...props}>
      <CoverImage />
      <div className="w-[450px] sticky top-0 rounded-4xl bg-muted p-1">
        <MintBox />
      </div>
    </div>
  )
}

export default LandingMint
