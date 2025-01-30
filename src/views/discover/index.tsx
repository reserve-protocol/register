import HistoricalTVL from './components/historical-tvl'
import DiscoverTabs from './components/discover-tabs'

const Discover = () => {
  return (
    <>
      <div className="border-b border-primary">
        <HistoricalTVL />
      </div>
      <DiscoverTabs className="mt-6 sm:mt-12" />
    </>
  )
}

export default Discover
