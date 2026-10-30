import GridStage from '../shared/grid-stage'
import { FlowLeft } from '../shared/grid-left'
import {
  HomeCountriesCard,
  HomeFintechCard,
  HomeHeldCard,
  HomeTransactionsCard,
  HomeUglyCashCard,
  HomeVolumeCard,
  TickerStyles,
} from '../shared/home-cards'
import HomeFooter from '../shared/home-footer'
import { DataNote } from '../shared/page-bits'

const V16Home = () => (
  <div className="container">
    <TickerStyles />
    <GridStage
      left={<FlowLeft />}
      cards={
        <>
          <HomeHeldCard />
          <HomeVolumeCard chart="line" />
          <HomeTransactionsCard chart="line" />
          <HomeCountriesCard />
          <HomeUglyCashCard />
          <HomeFintechCard />
        </>
      }
    />
    <DataNote className="mt-6 px-4 md:px-8" />
    <HomeFooter />
  </div>
)

export default V16Home
