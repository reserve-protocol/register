import { Trans, useLingui } from '@lingui/react/macro'
import { Skeleton } from '@/components/ui/skeleton'
import GridStage from './grid-stage'
import { TickerStyles } from './home-cards'
import HomeFooter from './home-footer'
import { DataNote } from './page-bits'
import { useUglycashData } from './uglycash-data'
import { Reveal } from './card-shell'
import { DATA_CARD_TITLES } from './home-skeletons'
import { DataCardPlaceholder } from './v18-cards'
import { CountriesCardV26, DiscoverDtfsCardV26 } from './v26-cards'
import {
  CountriesCardV18,
  FintechCardV18,
  HeldCardV18,
  TransactionsCardV18,
  UglyCashCardV18,
  VolumeCardV18,
} from './v18-cards'

const LastUpdated = () => {
  const { generatedAt, status } = useUglycashData()
  if (!status) return null
  return (
    <div className="mt-1 h-5 px-4 text-sm text-legend md:px-8">
      <Reveal
        ready={status === 'ready'}
        skeleton={
          <div className="flex h-5 items-center">
            <Skeleton className="h-3.5 w-48" />
          </div>
        }
      >
        <p>
          Last updated{' '}
          {generatedAt &&
            new Date(generatedAt).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
        </p>
      </Reveal>
    </div>
  )
}

const V18Page = ({
  left,
  cardShadow = true,
  scale = 'month',
  sortTooltips = false,
  dataState = 'ready',
  v26 = false,
}: {
  left: React.ReactNode
  cardShadow?: boolean
  scale?: 'month' | 'week'
  sortTooltips?: boolean
  dataState?: 'ready' | 'error'
  v26?: boolean
}) => {
  const { t } = useLingui()
  return (
  <div className="container">
    <TickerStyles />
    <GridStage
      left={left}
      cards={
        <>
          {dataState === 'ready' ? (
            <>
              <HeldCardV18 smoothTicker={v26} />
              <VolumeCardV18 scale={scale} sortTooltip={sortTooltips} smoothTicker={v26} />
              <TransactionsCardV18 scale={scale} sortTooltip={sortTooltips} smoothTicker={v26} />
            </>
          ) : (
            DATA_CARD_TITLES.map((title) => (
              <DataCardPlaceholder key={title} title={title} state="error" />
            ))
          )}
          {v26 ? <CountriesCardV26 /> : <CountriesCardV18 />}
          <UglyCashCardV18
            shadow={cardShadow}
            smoothTicker={v26}
            value={v26 ? t`The financial home for people that make money on the internet` : undefined}
            description={
              v26 ? (
                <Trans>
                  UGLYCASH is the Reserve App, and it’s on track to fuel huge growth in eUSD
                </Trans>
              ) : undefined
            }
          />
          <FintechCardV18
            contactEmail={v26 ? 'gabo@reserve.org' : undefined}
            description={v26 ? <Trans>Start monetizing your stablecoin balances with eUSD the way UGLYCASH does.</Trans> : undefined}
          />
          {v26 && <DiscoverDtfsCardV26 />}
        </>
      }
    />
    <DataNote v26={v26} className="mt-6 px-4 md:px-8" />
    <LastUpdated />
    <HomeFooter />
  </div>
  )
}

export default V18Page
