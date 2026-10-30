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
import { FlowChartLeft } from '../shared/grid-left'

const V14GridFlowChart = () => (
  <div className="pb-24">
    <GridStage
      leftClassName="items-stretch justify-start overflow-hidden p-0 pt-6 pb-0 lg:pb-0 xl:pb-[120px]"
      left={<FlowChartLeft />}
      cards={
        <>
          <UglyCashCard />
          <MovedCard />
          <TypesCard />
          <CountriesCard />
          <TransactionsCard />
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

export default V14GridFlowChart
