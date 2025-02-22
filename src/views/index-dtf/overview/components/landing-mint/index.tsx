import CoverPlaceholder from '@/components/icons/cover-placeholder'
import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeftRight } from 'lucide-react'
import React from 'react'
import ZapMint from '../zap-mint'
import { currentZapMintTabAtom } from '../zap-mint/atom'
import { Skeleton } from '@/components/ui/skeleton'

const MintBox = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const brand = useAtomValue(indexDTFBrandAtom)
  const chainId = useAtomValue(chainIdAtom)
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

  if (!brand) {
    return <Skeleton className="w-[456px] h-[456px] rounded-3xl" />
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-muted p-1">
      {brand?.dtf?.cover ? (
        <img
          width={448}
          height={448}
          className="object-cover h-[448px] w-[448px] rounded-3xl"
          alt="DTF meme"
          src={brand.dtf.cover}
        />
      ) : (
        <CoverPlaceholder className="text-legend" />
      )}
    </div>
  )
}

const LandingMint = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="hidden xl:flex xl:flex-col xl:gap-1 relative" {...props}>
      <CoverImage />
      <div className="w-[456px] sticky top-0 rounded-3xl bg-muted p-1">
        <MintBox />
      </div>
    </div>
  )
}

export default LandingMint
