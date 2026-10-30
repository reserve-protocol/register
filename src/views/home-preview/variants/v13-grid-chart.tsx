import { DataNote } from '../shared/page-bits'
import GridStage from '../shared/grid-stage'
import {
  CountriesCard,
  FintechEndCard,
  MovedCard,
  PaydayCard,
  TransactionsCard,
  TypesCard,
  UglyCashCard,
} from '../shared/grid-cards'
import { ChartLeft } from '../shared/grid-left'

const V13GridChart = () => (
  <div className="pb-24">
    <GridStage
      leftClassName="items-stretch justify-start p-0 pb-0 lg:pb-0 xl:pb-0 overflow-hidden"
      left={<ChartLeft />}
      cards={
        <>
          <UglyCashCard />
          <MovedCard />
          <TransactionsCard />
          <TypesCard />
          <CountriesCard />
          <PaydayCard />
          <FintechEndCard />
        </>
      }
    />
    <div className="container mt-10 px-4 md:px-6">
      <DataNote />
    </div>
  </div>
)

export default V13GridChart
