import { useLocation } from 'react-router-dom'
import { GLOBAL_COUNTRY_COUNT } from './mock/ugly-cash-series'
import GridStage from './shared/grid-stage'
import {
  CountriesCardSkeleton,
  DATA_CARD_TITLES,
  DataCardSkeleton,
  LeftSkeleton,
} from './shared/home-skeletons'
import { FintechCardV18, UglyCashCardV18 } from './shared/static-cards'

const GLOBE_VARIANTS = ['v21', 'v24', 'v25']

// The grid previews (v12+) load behind the same stage they render, with skeletons only where data goes.
const PreviewFallback = () => {
  const { pathname } = useLocation()
  const variant = pathname.split('/')[2] ?? ''
  const n = Number(variant.replace('v', ''))
  if (!(n >= 12)) return <div className="h-[calc(100svh-72px)]" />

  return (
    <div className="container">
      <GridStage
        left={
          <LeftSkeleton
            kind={GLOBE_VARIANTS.includes(variant) ? 'globe' : 'flow'}
          />
        }
        cards={
          <>
            {DATA_CARD_TITLES.map((title) => (
              <DataCardSkeleton key={title} title={title} />
            ))}
            <CountriesCardSkeleton
              title={`Live in ${GLOBAL_COUNTRY_COUNT} countries`}
            />
            <UglyCashCardV18 shadow={false} />
            <FintechCardV18 />
          </>
        }
      />
    </div>
  )
}

export default PreviewFallback
