import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import PancakeSwap from '@/components/icons/logos/PancakeSwap'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { isSafeHttpUrl } from '@/utils/url'
import useComplianceRestrictions from '@/hooks/use-compliance-restrictions'
import { useIsLargeDesktop } from '@/hooks/use-media-query'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import {
  indexDTFAtom,
  indexDTFBrandAtom,
  indexDTFBrandExtrasResolvedAtom,
  indexDTFStatusAtom,
} from '@/state/dtf/atoms'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { Trans, useLingui } from '@lingui/react/macro'
import { useZapperModal } from '@reserve-protocol/react-zapper'
import { useAtomValue } from 'jotai'
import { ChevronDown } from 'lucide-react'
import React from 'react'
import EligibilityCard from '../eligibility-card'
import IndexAboutOverview from '../index-about-overview'
import DTFBalance from './dtf-balance'
import DtfCover, {
  DtfCoverSkeleton,
  getDtfCoverImage,
  getDtfCoverVideo,
} from './dtf-cover'
import { getDtfDexLinks, type DtfDexLink } from './external-dex-links'

const TokenInfo = () => {
  return <DTFBalance />
}

const ExternalDexDropdown = ({
  links,
  onSelect,
}: {
  links: DtfDexLink[]
  onSelect: (link: DtfDexLink) => void
}) => {
  const { t } = useLingui()
  const safeLinks = links.filter((link) => isSafeHttpUrl(link.url))

  if (!safeLinks.length) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-12 shrink-0 gap-1.5 rounded-xl px-4 text-base font-medium text-muted-foreground hover:text-foreground"
          aria-label={t`External trading venues`}
        >
          <Trans>External markets</Trans>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
        {safeLinks.map((link) => (
          <DropdownMenuItem key={link.url} className="rounded-lg" asChild>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onSelect(link)}
            >
              <PancakeSwap className="h-4 w-4" />
              <span>{link.label}</span>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const MintBox = () => {
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')
  const { open, setTab } = useZapperModal()
  const dtf = useAtomValue(indexDTFAtom)
  const status = useAtomValue(indexDTFStatusAtom)
  const isDeprecated = isInactiveDTF(status)
  const { isLoading: isComplianceLoading, data: complianceData } =
    useComplianceRestrictions()
  const isRestricted = !!complianceData?.restricted
  const dexLinks = getDtfDexLinks(dtf?.chainId, dtf?.id)

  return (
    <div className="rounded-3xl bg-card p-2">
      <TokenInfo />
      {isDeprecated && (
        <Alert variant="destructive" className="mb-2 rounded-xl">
          <AlertTitle>
            <Trans>This DTF can only be sold</Trans>
          </AlertTitle>
          <AlertDescription className="text-muted-foreground">
            <Trans>
              This DTF is no longer actively governed, cannot rebalance, and no
              new ${dtf?.token.symbol} can be created.
            </Trans>
          </AlertDescription>
        </Alert>
      )}
      {isComplianceLoading ? (
        <div className="flex gap-2">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-36 rounded-xl" />
        </div>
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
        <div className="flex gap-2">
          <Button
            className="h-12 flex-1 rounded-xl text-base font-medium"
            onClick={() => {
              trackClick('buy_sell')
              setTab(isDeprecated ? 'sell' : 'buy')
              open()
            }}
          >
            {isDeprecated ? <Trans>Sell</Trans> : <Trans>Buy / Sell</Trans>}
          </Button>
          {!isDeprecated && (
            <ExternalDexDropdown
              links={dexLinks}
              onSelect={(link) => {
                trackClick('external_dex', {
                  dex: link.label,
                  url: link.url,
                })
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}

const LandingMint = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { data: complianceData } = useComplianceRestrictions()
  const brand = useAtomValue(indexDTFBrandAtom)
  const brandExtrasResolved = useAtomValue(indexDTFBrandExtrasResolvedAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const isGeoRestricted = complianceData?.reason === 'geolocation-restricted'
  const isLargeDesktop = useIsLargeDesktop()
  const hasVideoThumbnail =
    !!brand?.dtf?.video?.trim() && !!getDtfCoverVideo(dtf?.token.symbol)
  const hasCover = hasVideoThumbnail || !!getDtfCoverImage(brand?.dtf?.cover)

  return (
    <div
      className="hidden xl:flex xl:w-[480px] xl:flex-col xl:gap-1 relative max-w-[480px]"
      {...props}
    >
      {/* The slot assumes a video cover (they all get one eventually) and
          holds a skeleton while brand data loads. If the DTF turns out to
          have none, it collapses smoothly — the skeleton stays rendered
          inside the shrinking row instead of vanishing in one frame. */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-500 ease-out motion-reduce:transition-none',
          hasCover || brand === undefined || !brandExtrasResolved
            ? 'grid-rows-[1fr]'
            : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="rounded-3xl bg-card p-2">
            {hasCover ? (
              <DtfCover className="rounded-xl" />
            ) : (
              <DtfCoverSkeleton className="rounded-xl" />
            )}
          </div>
        </div>
      </div>
      <div className={isGeoRestricted ? 'z-10' : 'sticky top-1 z-10'}>
        {isGeoRestricted ? (
          <EligibilityCard className="bg-card" />
        ) : (
          <MintBox />
        )}
      </div>
      <div className="flex flex-col gap-1">
        {/* WHY: mirror of the sub-xl about card (see overview AboutSection) —
            only one copy is mounted at a time, so it owns #about at xl. */}
        {isLargeDesktop && (
          <div id="about" className="rounded-3xl bg-card">
            <IndexAboutOverview />
          </div>
        )}
      </div>
    </div>
  )
}

export default LandingMint
