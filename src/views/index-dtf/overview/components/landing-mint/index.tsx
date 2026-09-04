import CowSwap from '@/components/icons/logos/CowSwap'
import PancakeSwap from '@/components/icons/logos/PancakeSwap'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import useComplianceRestrictions from '@/hooks/use-compliance-restrictions'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { useIsLargeDesktop } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import {
  indexDTFAtom,
  indexDTFBrandAtom,
  indexDTFStatusAtom,
} from '@/state/dtf/atoms'
import { RESERVE_API, ZAPPER_API } from '@/utils/constants'
import { isSafeHttpUrl } from '@/utils/url'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import React, { type ComponentType, type SVGProps } from 'react'
import ZapperWrapper from '../../../components/zapper/zapper-wrapper'
import { indexDTFQuoteSourceAtom } from '../../../issuance'
import AboutDTF, { useHasVideoLibrary } from '../about-dtf'
import AboutReserve from '../about-reserve'
import AskReserveAI from '../ask-reserve-ai'
import EligibilityCard from '../eligibility-card'
import DTFBalance from './dtf-balance'
import DtfCover, {
  DtfCoverSkeleton,
  getDtfCoverImage,
  getDtfCoverVideo,
} from './dtf-cover'
import { getDtfDexLinks, type DtfDex } from './external-dex-links'

export const DEX_ICONS: Record<
  DtfDex,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  pancakeswap: PancakeSwap,
  cowswap: CowSwap,
}

type ExternalPlatform = {
  label: string
  url: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const useExternalPlatforms = (): ExternalPlatform[] => {
  const dtf = useAtomValue(indexDTFAtom)
  const dexLinks = getDtfDexLinks(dtf?.chainId, dtf?.id)

  return dexLinks
    .filter((link) => isSafeHttpUrl(link.url))
    .map((link) => ({
      label: link.label,
      url: link.url,
      Icon: DEX_ICONS[link.dex],
    }))
}

const ExternalPlatformsPlug = () => {
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')
  const platforms = useExternalPlatforms()

  if (!platforms.length) return null

  return (
    <div className="mt-4 mb-2 flex flex-wrap items-center justify-end gap-x-3 gap-y-1 px-2 text-xs text-muted-foreground">
      <span>
        <Trans>Also available on:</Trans>
      </span>
      {platforms.map((platform) => (
        <a
          key={platform.url}
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackClick('external_dex', {
              dex: platform.label,
              url: platform.url,
            })
          }}
          className="flex items-center gap-1 font-medium text-foreground transition-colors hover:text-primary"
        >
          <platform.Icon className="h-3.5 w-3.5" />
          {platform.label}
        </a>
      ))}
    </div>
  )
}

const InlineSwapBox = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const quoteSource = useAtomValue(indexDTFQuoteSourceAtom)
  const status = useAtomValue(indexDTFStatusAtom)
  const isDeprecated = isInactiveDTF(status)
  const { isLoading: isComplianceLoading, data: complianceData } =
    useComplianceRestrictions()
  const isRestricted = !!complianceData?.restricted
  // One Zapper per route (docs/wiki/zapper.md): mounted here only at xl, the
  // container skips its modal mount at xl — same useIsLargeDesktop on both sides.
  const isLargeDesktop = useIsLargeDesktop()

  if (!dtf) {
    return (
      <div className="rounded-3xl bg-card p-2">
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-card p-2">
      <DTFBalance />
      {isDeprecated && (
        <Alert variant="destructive" className="mb-2 rounded-xl">
          <AlertTitle>
            <Trans>This DTF can only be sold</Trans>
          </AlertTitle>
          <AlertDescription className="text-muted-foreground">
            <Trans>
              This DTF is no longer actively governed, cannot rebalance, and no
              new ${dtf.token.symbol} can be created.
            </Trans>
          </AlertDescription>
        </Alert>
      )}
      {isComplianceLoading ? (
        <Skeleton className="h-[420px] w-full rounded-xl" />
      ) : isRestricted ? (
        <Alert variant="destructive" className="w-full rounded-xl">
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
        isLargeDesktop && (
          // Zero the package's tabpanel mt-2: nothing sits above it here.
          <div
            data-testid="overview-inline-zapper"
            className="[&_[role=tabpanel]]:mt-0"
          >
            <ZapperWrapper
              chain={dtf.chainId}
              dtfAddress={dtf.id}
              mode="inline"
              apiUrl={RESERVE_API}
              zapperApiUrl={ZAPPER_API}
              defaultSource={quoteSource}
              sellOnly={isDeprecated}
              disabled={isRestricted}
            />
            {!isDeprecated && <ExternalPlatformsPlug />}
          </div>
        )
      )}
    </div>
  )
}

// Sits under the swap box: the zapper owns the top of the rail.
// While the DTF loads, the slot holds a video-shaped skeleton. Once it
// settles: a cover fades in, or — no cover — the skeleton is dropped and the
// row collapses. The skeleton never lingers on the settled no-cover state.
// DTFs with a video library skip the cover: their explainer lives in the
// library below.
const CoverSlot = () => {
  const brand = useAtomValue(indexDTFBrandAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const hasVideoLibrary = useHasVideoLibrary()
  const hasVideoThumbnail =
    !!brand?.dtf?.video?.trim() && !!getDtfCoverVideo(dtf?.token.symbol)
  const hasCover =
    !hasVideoLibrary &&
    (hasVideoThumbnail || !!getDtfCoverImage(brand?.dtf?.cover))

  return (
    <div
      data-testid="overview-cover-slot"
      className={cn(
        'grid transition-[grid-template-rows] duration-500 ease-out motion-reduce:transition-none',
        hasCover || dtf === undefined ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
      )}
    >
      <div className="overflow-hidden">
        <div className="rounded-3xl bg-card p-2">
          {hasCover ? (
            <DtfCover className="rounded-xl" />
          ) : dtf === undefined ? (
            <DtfCoverSkeleton className="rounded-xl" />
          ) : null}
        </div>
      </div>
    </div>
  )
}

const LandingMint = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { data: complianceData } = useComplianceRestrictions()
  const isGeoRestricted = complianceData?.reason === 'geolocation-restricted'
  const isLargeDesktop = useIsLargeDesktop()

  // Below xl the page flow renders these cards (overview AboutSection).
  if (!isLargeDesktop) return null

  return (
    <div
      className="hidden xl:flex xl:w-[480px] xl:flex-col xl:gap-1 relative max-w-[480px]"
      {...props}
    >
      <div>
        {isGeoRestricted ? (
          <EligibilityCard className="bg-card" />
        ) : (
          <InlineSwapBox />
        )}
      </div>
      <CoverSlot />
      <div id="about">
        <AboutDTF />
      </div>
      <AskReserveAI />
      <AboutReserve />
    </div>
  )
}

export default LandingMint
