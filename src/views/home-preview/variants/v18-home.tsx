import GridStage from '../shared/grid-stage'
import { FlowLeft } from '../shared/grid-left'
import { TickerStyles } from '../shared/home-cards'
import HomeFooter from '../shared/home-footer'
import { DataNote } from '../shared/page-bits'
import {
  CountriesCardV18,
  FintechCardV18,
  HeldCardV18,
  TransactionsCardV18,
  UglyCashCardV18,
  VolumeCardV18,
} from '../shared/v18-cards'

const V18Home = () => (
  <div className="container">
    <TickerStyles />
    <GridStage
      left={<FlowLeft />}
      cards={
        <>
          <HeldCardV18 />
          <VolumeCardV18 />
          <TransactionsCardV18 />
          <CountriesCardV18 />
          <UglyCashCardV18 />
          <FintechCardV18 />
        </>
      }
    />
    <DataNote className="mt-6 px-4 md:px-8" />
    <HomeFooter />
  </div>
)

export default V18Home
