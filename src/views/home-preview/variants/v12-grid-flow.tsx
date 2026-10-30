import { DataNote } from '../shared/page-bits'
import GridStage from '../shared/grid-stage'
import {
  CountriesCard,
  FintechEndCard,
  HeldCard,
  MovedCard,
  PaydayCard,
  TransactionsCard,
  UglyCashCard,
} from '../shared/grid-cards'
import { FlowLeft } from '../shared/grid-left'

const V12GridFlow = () => (
  <div className="pb-24">
    <GridStage
      left={<FlowLeft />}
      cards={
        <>
          <HeldCard />
          <MovedCard />
          <TransactionsCard />
          <CountriesCard />
          <UglyCashCard />
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

export default V12GridFlow
