import GridStage from './grid-stage'
import { TickerStyles } from './home-cards'
import HomeFooter from './home-footer'
import { DataNote } from './page-bits'
import {
  CountriesCardV18,
  FintechCardV18,
  HeldCardV18,
  TransactionsCardV18,
  UglyCashCardV18,
  VolumeCardV18,
} from './v18-cards'

const V18Page = ({
  left,
  cardShadow = true,
}: {
  left: React.ReactNode
  cardShadow?: boolean
}) => (
  <div className="container">
    <TickerStyles />
    <GridStage
      left={left}
      cards={
        <>
          <HeldCardV18 />
          <VolumeCardV18 />
          <TransactionsCardV18 />
          <CountriesCardV18 />
          <UglyCashCardV18 shadow={cardShadow} />
          <FintechCardV18 />
        </>
      }
    />
    <DataNote className="mt-6 px-4 md:px-8" />
    <HomeFooter />
  </div>
)

export default V18Page
