import HistoricalTVL from './components/historical-tvl'
import DiscoverTabs from './components/discover-tabs'

const Discover = () => {
  return (
    <>
      <div className="bg-primary">
        <HistoricalTVL />
      </div>
      <DiscoverTabs className="mt-12" />
    </>
  )
}

export default Discover
