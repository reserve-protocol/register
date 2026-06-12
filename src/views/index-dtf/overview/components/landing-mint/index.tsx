import CoverPlaceholder from '@/components/icons/cover-placeholder'
import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Trans, useLingui } from '@lingui/react/macro'
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
import EligibilityCard from '../eligibility-card'
import useComplianceRestrictions from '@/hooks/use-compliance-restrictions'

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
          {isDeprecated ? (
            <Trans>Sell ${dtf?.token.symbol} onchain</Trans>
          ) : (
            <Trans>Buy/Sell ${dtf?.token.symbol} onchain</Trans>
          )}
        </div>
        <div className="text-legend text-sm">
          {isDeprecated ? (
            <Trans>
              This DTF is no longer actively governed and can only be sold. This
              DTF cannot rebalance its basket nor can new ${dtf?.token.symbol}{' '}
              tokens be created.
            </Trans>
          ) : (
            <Trans>
              Our Zap-swaps support common assets like {tokensText} which makes
              DTFs easy to enter and exit.
            </Trans>
          )}
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
  const { isLoading: isComplianceLoading, data: complianceData } =
    useComplianceRestrictions()
  const isRestricted = !!complianceData?.restricted

  return (
    <div className="rounded-3xl bg-card p-2">
      <TokenInfo />
      <div className="flex flex-col gap-2">
        {isComplianceLoading ? (
          <>
            <Skeleton className="rounded-xl h-12" />
            <Skeleton className="rounded-xl h-12" />
          </>
        ) : isRestricted ? (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertTitle>{complianceData?.title}</AlertTitle>
            <AlertDescription>
              {complianceData?.description}{' '}
              <a
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
                href="https://reserve.org/terms-and-conditions"
              >
                <Trans>Learn More</Trans>
              </a>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Button
              className="rounded-xl h-12"
              disabled={isDeprecated}
              onClick={() => {
                trackClick('buy')
                setTab('buy')
                open()
              }}
            >
              <Trans>Buy</Trans>
            </Button>
            <Button
              className="rounded-xl h-12"
              variant="outline"
              onClick={() => {
                trackClick('sell')
                setTab('sell')
                open()
              }}
            >
              <Trans>Sell</Trans>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

const CoverImage = () => {
  const { t } = useLingui()
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
        alt={t`DTF meme`}
        src={brand.dtf.cover}
      />
    )
  }

  return <CoverPlaceholder className="text-legend" />
}

const LandingMint = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { data: complianceData } = useComplianceRestrictions()

  return (
    <div className="hidden xl:flex xl:flex-col xl:gap-2 relative" {...props}>
      <CoverImage />
      {complianceData?.reason === 'geolocation-restricted' ? (
        <EligibilityCard className="w-[450px] sticky top-0" />
      ) : (
        <div className="w-[450px] sticky top-0 rounded-4xl bg-muted p-1">
          <MintBox />
        </div>
      )}
    </div>
  )
}

export default LandingMint
