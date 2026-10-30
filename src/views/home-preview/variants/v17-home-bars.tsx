import GridStage from '../shared/grid-stage'
import { FlowLeft } from '../shared/grid-left'
import {
  HomeCountriesCard,
  HomeFintechPrimaryCard,
  HomeHeldCard,
  HomeTransactionsCard,
  HomeUglyCashCard,
  HomeVolumeCard,
  TickerStyles,
} from '../shared/home-cards'
import HomeFooter from '../shared/home-footer'
import { DataNote } from '../shared/page-bits'

const V17HomeBars = () => (
  <div className="container">
    <TickerStyles />
    <GridStage
      left={<FlowLeft />}
      cards={
        <>
          <HomeHeldCard />
          <HomeVolumeCard chart="bars" />
          <HomeTransactionsCard chart="bars" />
          <HomeCountriesCard />
          <HomeUglyCashCard />
          <HomeFintechPrimaryCard />
        </>
      }
    />
    <DataNote className="mt-6 px-4 md:px-8" />
    <HomeFooter />
  </div>
)

export default V17HomeBars
