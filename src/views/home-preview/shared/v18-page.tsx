import { Skeleton } from '@/components/ui/skeleton'
import GridStage from './grid-stage'
import { TickerStyles } from './home-cards'
import HomeFooter from './home-footer'
import { DataNote } from './page-bits'
import { useUglycashData } from './uglycash-data'
import { Reveal } from './card-shell'
import { DATA_CARD_TITLES } from './home-skeletons'
import { DataCardPlaceholder } from './v18-cards'
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
}: {
  left: React.ReactNode
  cardShadow?: boolean
  scale?: 'month' | 'week'
  sortTooltips?: boolean
  dataState?: 'ready' | 'error'
}) => (
  <div className="container">
    <TickerStyles />
    <GridStage
      left={left}
      cards={
        <>
          {dataState === 'ready' ? (
            <>
              <HeldCardV18 />
              <VolumeCardV18 scale={scale} sortTooltip={sortTooltips} />
              <TransactionsCardV18 scale={scale} sortTooltip={sortTooltips} />
            </>
          ) : (
            DATA_CARD_TITLES.map((title) => (
              <DataCardPlaceholder key={title} title={title} state="error" />
            ))
          )}
          <CountriesCardV18 />
          <UglyCashCardV18 shadow={cardShadow} />
          <FintechCardV18 />
        </>
      }
    />
    <DataNote className="mt-6 px-4 md:px-8" />
    <LastUpdated />
    <HomeFooter />
  </div>
)

export default V18Page
