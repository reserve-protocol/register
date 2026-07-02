import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import useComplianceRestrictions from '@/hooks/use-compliance-restrictions'
import { useIsLargeDesktop } from '@/hooks/use-media-query'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { indexDTFAtom, indexDTFStatusAtom } from '@/state/dtf/atoms'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { Trans } from '@lingui/react/macro'
import { useZapperModal } from '@reserve-protocol/react-zapper'
import { useAtomValue } from 'jotai'
import React from 'react'
import EligibilityCard from '../eligibility-card'
import IndexAboutOverview from '../index-about-overview'
import IndexTokenAddress from '../index-token-address'
import DTFBalance from './dtf-balance'

const TokenInfo = () => {
  return <DTFBalance />
}

const DesktopTokenAddressButton = ({ className }: { className?: string }) => (
  <IndexTokenAddress
    theme="light"
    className={`h-12 justify-between rounded-xl bg-transparent px-3 text-base font-medium ${className ?? 'w-auto'}`}
    labelClassName="text-base font-normal text-muted-foreground"
    labelGroupClassName="h-full gap-1.5"
    stackedLogoClassName="pt-0"
    logoClassName="h-5 w-5 rounded-md border-2 border-card bg-card"
    chevronClassName="text-muted-foreground"
  />
)

const MintBox = () => {
  const { trackClick } = useTrackIndexDTFClick('overview', 'overview')
  const { open, setTab } = useZapperModal()
  const dtf = useAtomValue(indexDTFAtom)
  const status = useAtomValue(indexDTFStatusAtom)
  const isDeprecated = isInactiveDTF(status)
  const { isLoading: isComplianceLoading, data: complianceData } =
    useComplianceRestrictions()
  const isRestricted = !!complianceData?.restricted

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
        <div className="flex flex-col gap-2">
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
          <DesktopTokenAddressButton className="w-full" />
        </div>
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
          <DesktopTokenAddressButton />
        </div>
      )}
    </div>
  )
}

const LandingMint = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { data: complianceData } = useComplianceRestrictions()
  const isGeoRestricted = complianceData?.reason === 'geolocation-restricted'
  const isLargeDesktop = useIsLargeDesktop()

  return (
    <div
      className="hidden xl:flex xl:w-[480px] xl:flex-col xl:gap-1 relative max-w-[480px]"
      {...props}
    >
      <div className={isGeoRestricted ? 'z-10' : 'sticky top-0 z-10'}>
        {isGeoRestricted ? (
          <div className="flex flex-col gap-1">
            <div className="rounded-3xl bg-card p-2">
              <DesktopTokenAddressButton className="w-full" />
            </div>
            <EligibilityCard className="bg-card" />
          </div>
        ) : (
          <MintBox />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        {/* WHY: mirror of the sub-xl about card (see overview AboutSection) —
            only one copy is mounted at a time, so it owns #about at xl. */}
        {isLargeDesktop && (
          <div id="about" className="flex-1 rounded-3xl bg-card">
            <IndexAboutOverview showCover />
          </div>
        )}
      </div>
    </div>
  )
}

export default LandingMint
