import CoverPlaceholder from '@/components/icons/cover-placeholder'
import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import {
  indexDTFAtom,
  indexDTFBrandAtom,
  indexDTFStatusAtom,
} from '@/state/dtf/atoms'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { useZapperModal, zappableTokens } from '@reserve-protocol/react-zapper'
import { useAtomValue } from 'jotai'
import { ArrowDown, ArrowLeftRight } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import DTFBalance from './dtf-balance'
import useIsComplianceRestricted from '@/hooks/use-is-compliance-restricted'

const TokenInfo = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const brand = useAtomValue(indexDTFBrandAtom)
  const status = useAtomValue(indexDTFStatusAtom)
  const isDeprecated = isInactiveDTF(status)
  const tokens = zappableTokens[dtf?.chainId ?? 1]
  const tokenSymbols = tokens.map((t) => t.symbol)
  const tokensText =
    tokenSymbols.length > 1
      ? `${tokenSymbols.slice(0, -1).join(', ')} and ${tokenSymbols[tokenSymbols.length - 1]}`
      : (tokenSymbols[0] ?? '')

  return (
    <div className="flex flex-col justify-between gap-8 p-4">
      <div className="flex items-center gap-2">
        <StackTokenLogo tokens={tokens} size={24} outsource />
        {isDeprecated ? (
          <ArrowDown className="w-4 h-4" />
        ) : (
          <ArrowLeftRight className="w-4 h-4" />
        )}
        <TokenLogo
          className="mr-auto"
          src={brand?.dtf?.icon || undefined}
          size="lg"
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-2xl font-light text-primary">
          {isDeprecated
            ? `Sell $${dtf?.token.symbol} onchain`
            : `Buy/Sell $${dtf?.token.symbol} onchain`}
        </div>
        <div className="text-legend text-sm">
          {isDeprecated
            ? `This DTF is no longer actively governed and can only be sold. This DTF cannot rebalance its basket nor can new $${dtf?.token.symbol} tokens be created.`
            : `Our Zap-swaps support common assets like ${tokensText} which makes DTFs easy to enter and exit.`}
        </div>
      </div>
      <DTFBalance />
    </div>
  )
}

const MintBox = () => {
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')
  const { open, setTab } = useZapperModal()
  const status = useAtomValue(indexDTFStatusAtom)
  const isDeprecated = isInactiveDTF(status)
  const isRestricted = useIsComplianceRestricted()

  return (
    <div className="rounded-3xl bg-card p-2">
      <TokenInfo />
      <div className="flex flex-col gap-2">
        <Button
          className="rounded-xl h-12"
          disabled={isDeprecated || isRestricted}
          onClick={() => {
            trackClick('buy')
            setTab('buy')
            open()
          }}
        >
          Buy
        </Button>
        <Button
          className="rounded-xl h-12"
          disabled={isRestricted}
          variant="outline"
          onClick={() => {
            trackClick('sell')
            setTab('sell')
            open()
          }}
        >
          Sell
        </Button>
        {isRestricted && (
          <p className="text-legend text-sm text-center px-2 pt-1">
            This product isn't available in your region due to local
            restrictions.{' '}
            <a
              className="text-primary underline"
              target="_blank"
              rel="noopener noreferrer"
              href="https://reserve.org/terms-and-conditions"
            >
              Learn More
            </a>
          </p>
        )}
      </div>
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
        } catch (error) { }
        setIsLoading(false)
      }

      loadImage()
    }
  }, [brand])

  if (isLoading) {
    return <Skeleton className="w-[450px] h-[450px] rounded-4xl" />
  }

  if (brand?.dtf?.cover) {
    return (
      <img
        width={450}
        height={450}
        className="object-cover h-[450px] w-[450px] rounded-4xl"
        alt="DTF meme"
        src={brand.dtf.cover}
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
